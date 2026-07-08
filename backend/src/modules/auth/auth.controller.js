const User = require('../../models/User');
const authService = require('./auth.service');
const asyncHandler = require('../../middleware/asyncHandler.middleware');

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hashedPassword = await authService.hashPassword(password);
    const newUser = new User({
      firstName, lastName, email, password: hashedPassword, role,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      status: 'pending', isActive: false,
    });
    if (role === 'student') newUser.enrolledCourses = [];
    else if (role === 'professor') newUser.assignedCourses = [];
    await newUser.save();
    const token = authService.generateToken(newUser);
    res.status(201).json({ message: 'User created successfully', token, user: authService.formatUser(newUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// Mahmoud — PATCH /api/auth/profile — update own profile (firstName, lastName, email, phone)
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, email, phone },
    { new: true, runValidators: true }
  ).select('-password');
  if (!updated) return res.status(404).json({ message: 'User not found' });
  res.json({ user: authService.formatUser(updated) });
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: email }] }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    const token = authService.generateToken(user);
    res.json({ message: 'Login successful', token, user: authService.formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};
