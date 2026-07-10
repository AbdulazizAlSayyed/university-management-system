const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const { sendCredentialsEmail } = require('../../utils/mailer');

const UNIVERSITY_DOMAIN = process.env.UNIVERSITY_DOMAIN || 'unihub.edu';

function generateTempPassword() {
  return crypto.randomBytes(6).toString('hex');
}

function generateUniversityEmail(firstName, lastName, suffix) {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  const s = suffix ? `${base}${suffix}` : base;
  return `${s}@${UNIVERSITY_DOMAIN}`;
}

async function findAvailableEmail(firstName, lastName) {
  let suffix = 0;
  let email;
  do {
    email = generateUniversityEmail(firstName, lastName, suffix > 0 ? suffix : null);
    const exists = await User.findOne({ email });
    if (!exists) return email;
    suffix++;
  } while (true);
}

async function listUsers(statusFilter) {
  const query = statusFilter ? { status: statusFilter } : {};
  return User.find(query).sort({ createdAt: -1 });
}

async function provisionUser({ userId, universityEmail, extraFields = {} }) {
  const user = userId
    ? await User.findById(userId)
    : null;

  if (userId && !user) {
    throw { status: 404, message: 'Request not found' };
  }

  const target = user || new User({ ...extraFields });

  const email = universityEmail || await findAvailableEmail(target.firstName, target.lastName);

  const emailTaken = await User.findOne({ email, _id: { $ne: userId } });
  if (emailTaken) {
    throw { status: 400, message: 'That university email is already in use' };
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  Object.assign(target, extraFields, {
    email,
    password: hashedPassword,
    status: 'active'
  });

  await target.save();

  await sendCredentialsEmail({
    to: target.personalEmail,
    firstName: target.firstName,
    universityEmail: email,
    password: tempPassword,
    role: target.role
  });

  await Notification.create({
    userId: target._id,
    type: 'activation',
    title: 'Account activated',
    body: `Your ${target.role} account has been activated. Check your personal email for login credentials.`,
    link: '/login'
  });

  return { user: target, tempPassword };
}

async function setUserStatus(userId, status) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  user.status = status;
  await user.save();

  await Notification.create({
    userId: user._id,
    type: status === 'active' ? 'activation' : 'deactivation',
    title: status === 'active' ? 'Account activated' : 'Account deactivated',
    body: `Your ${user.role} account has been ${status === 'active' ? 'activated' : 'deactivated'}.`,
    link: '/login'
  });

  return user;
}

async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
}

// ---- Notifications ----

async function getNotifications(userId) {
  return Notification.find({ userId }).sort({ createdAt: -1 });
}

async function markNotificationRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) throw { status: 404, message: 'Notification not found' };
  notification.read = true;
  await notification.save();
  return notification;
}

async function markAllNotificationsRead(userId) {
  await Notification.updateMany({ userId, read: false }, { read: true });
  return { message: 'All notifications marked as read' };
}

module.exports = { listUsers, provisionUser, setUserStatus, deleteUser, getNotifications, markNotificationRead, markAllNotificationsRead };
