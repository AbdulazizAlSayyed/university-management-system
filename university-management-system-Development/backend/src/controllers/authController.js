const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { getModelForRole } = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendResetEmail } = require('../utils/mailer');

// STUDENT/PROFESSOR submits a request for an account.
// Creates a User doc with status 'requested' — automatically provisions unihub.edu email.
exports.requestAccount = async (req, res) => {
  try {
    const { firstName, lastName, personalEmail, role, dateOfBirth, title, year } = req.body;

    const existing = await User.findOne({ personalEmail });
    if (existing) {
      return res.status(400).json({ message: 'A request or account already exists for this email' });
    }

    const Model = getModelForRole(role);

    // 1. Clean the names to create a formal institutional handle (e.g., nour.ahmad)
    const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
    const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
    const universityEmail = `${cleanFirst}.${cleanLast}@unihub.edu`;

    // 2. Build the request object with distinct email fields
    const requestData = {
      firstName,
      lastName,
      personalEmail,          // Maps to what they typed (e.g., nour@gmail.com)
      email: universityEmail, // Automatically provisioned (e.g., nour.ahmad@unihub.edu)
      role,
      status: 'requested'
    };

    if (role === 'student') {
      requestData.dateOfBirth = dateOfBirth || null;
      requestData.year = year;
    } else if (role === 'professor') {
      requestData.title = title;
      // explicitly ensure student fields are omitted/null for professors
      requestData.dateOfBirth = undefined; 
      requestData.year = undefined;
    }

    const request = await Model.create(requestData);

    res.status(201).json({
      message: 'Request submitted. An admin will email your login credentials soon.',
      requestId: request._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during account request' });
  }
};

// LOGIN — only works for accounts with status 'active'.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'requested') {
      return res.status(403).json({ message: 'Your account request is still pending admin review' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact an administrator.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetEmail({ to: user.email, resetLink });

    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};