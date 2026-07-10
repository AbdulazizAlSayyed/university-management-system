const adminService = require('./admin.service');

// GET /api/admin/users?status=requested
exports.listUsers = async (req, res) => {
  try {
    const users = await adminService.listUsers(req.query.status);
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/users/:id/approve
exports.approveRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const { user, tempPassword } = await adminService.provisionUser({ userId: req.params.id, universityEmail: email });
    res.status(200).json({ message: 'Account approved. Credentials have been sent.', user, tempPassword });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { email, ...rest } = req.body;
    const { user, tempPassword } = await adminService.provisionUser({ universityEmail: email, extraFields: rest });
    res.status(201).json({ message: 'Account created. Credentials have been sent.', user, tempPassword });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/users/:id/status  body: { status: 'active' | 'inactive' }
exports.setUserStatus = async (req, res) => {
  try {
    const user = await adminService.setUserStatus(req.params.id, req.body.status);
    res.status(200).json({ message: 'Status updated', user });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await adminService.getNotifications(req.user.id);
    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await adminService.markNotificationRead(req.params.id, req.user.id);
    res.json({ notification });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/admin/notifications/read-all
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await adminService.markAllNotificationsRead(req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
