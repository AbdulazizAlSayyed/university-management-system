const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

exports.hashPassword = async (password) => bcrypt.hash(password, 10);
exports.comparePassword = async (password, hash) => bcrypt.compare(password, hash);

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  status: user.status || (user.isActive ? 'active' : 'pending'),
  isActive: user.isActive,
  studentId: user.studentId || '',
  program: user.program || '',
  year: user.year || 1,
  department: user.department || '',
  title: user.title || '',
  avatarColor: user.avatarColor || 'bg-brand-600',
  username: user.username || `${user.firstName} ${user.lastName}`,
  createdAt: user.createdAt,
});
