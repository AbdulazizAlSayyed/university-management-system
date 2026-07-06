const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../models/User');
const { sendCredentialsEmail } = require('../../utils/mailer');

// Generates a random, readable temporary password (not sent as-is forever —
// user is expected to change it after first login).
function generateTempPassword() {
  return crypto.randomBytes(6).toString('hex'); // 12-character password
}

async function listUsers(statusFilter) {
  const query = statusFilter ? { status: statusFilter } : {};
  return User.find(query).sort({ createdAt: -1 });
}

// Turns a 'requested' user (or a brand-new one) into an active account
// with real university credentials, and emails those credentials.
async function provisionUser({ userId, universityEmail, extraFields = {} }) {
  const user = userId
    ? await User.findById(userId)
    : null;

  if (userId && !user) {
    throw { status: 404, message: 'Request not found' };
  }

  const emailTaken = await User.findOne({ email: universityEmail, _id: { $ne: userId } });
  if (emailTaken) {
    throw { status: 400, message: 'That university email is already in use' };
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const target = user || new User({ ...extraFields });
  Object.assign(target, extraFields, {
    email: universityEmail,
    password: hashedPassword,
    status: 'active'
  });

  await target.save();

  await sendCredentialsEmail({
    to: target.personalEmail,
    firstName: target.firstName,
    universityEmail,
    password: tempPassword,
    role: target.role
  });

  return target;
}

async function setUserStatus(userId, status) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  user.status = status;
  await user.save();
  return user;
}

async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
}

module.exports = { listUsers, provisionUser, setUserStatus, deleteUser };
