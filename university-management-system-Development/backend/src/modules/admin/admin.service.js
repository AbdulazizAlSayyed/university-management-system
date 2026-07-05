const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../models/User');
const { getModelForRole } = require('../../models/User');
const { sendCredentialsEmail } = require('../../utils/mailer');

// Generates a random, readable temporary password
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

  // 1. DYNAMICALLY GENERATE THE UNIVERSITY EMAIL HANDLE USING ONLY FIRST NAME
  const firstName = user ? user.firstName : extraFields.firstName;

  if (!firstName) {
    throw { status: 400, message: 'First name is required to generate institutional email' };
  }

  // Strip spaces and use only the first name
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
  const finalUniversityEmail = `${cleanFirst}@unihub.edu`;

  // Check if this newly generated email is taken by someone else
  const emailTaken = await User.findOne({ email: finalUniversityEmail, _id: { $ne: userId } });
  if (emailTaken) {
    throw { status: 400, message: 'That university email is already in use' };
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const Model = user ? null : getModelForRole(extraFields.role);
  const target = user || new Model({ ...extraFields });

  // 2. FORCE SYSTEM TO SAVE THE CORRECT EMAILS
  if (!user && universityEmail) {
    target.personalEmail = universityEmail; 
  }

  Object.assign(target, extraFields, {
    email: finalUniversityEmail, // Enforces firstname@unihub.edu strictly
    password: hashedPassword,
    status: 'active'
  });

  await target.save();

  // 3. SEND TO PERSONAL EMAIL SAFEBOX
  await sendCredentialsEmail({
    to: target.personalEmail, 
    firstName: target.firstName,
    universityEmail: finalUniversityEmail,
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