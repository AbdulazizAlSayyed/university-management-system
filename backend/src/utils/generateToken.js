<<<<<<< HEAD
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

module.exports = generateToken;
=======
import jwt from 'jsonwebtoken'

// Signs a JWT containing the user id and role.
export function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn })
}
>>>>>>> Development
