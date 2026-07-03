const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    // 💡 Updated to destructure firstName and lastName
    const { firstName, lastName, email, password, role } = req.body;

    // Check required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Instantiate new user document
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    // 💡 Apply conditional logic to match image_dad4cb.jpg rules
    if (role === 'admin') {
      newUser.enrolledCourses = undefined;
      newUser.assignedCourses = undefined;
    } else if (role === 'professor') {
      newUser.assignedCourses = []; // Professors only track courses they teach
      newUser.enrolledCourses = undefined;
    } else if (role === 'student') {
      newUser.enrolledCourses = []; // Students only track courses they take
      newUser.assignedCourses = undefined;
    }

    // Save the finalized document to MongoDB
    await newUser.save();

    // Generate JWT so they are instantly logged in upon registration
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token, // Token is sent right back to the frontend
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user, explicitly include password (since schema has select: false)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};