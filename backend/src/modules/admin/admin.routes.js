const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { validate, adminCreateUserSchema } = require('../../middleware/validate.middleware');
const controller = require('./admin.controller');

// Every route here requires a valid token AND the admin role.
router.use(verifyToken, authorize('admin'));

// Users
router.get('/users', controller.listUsers);
router.post('/users', validate(adminCreateUserSchema), controller.createUser);
router.post('/users/:id/approve', controller.approveRequest);
router.patch('/users/:id/status', controller.setUserStatus);
router.delete('/users/:id', controller.deleteUser);

// Notifications
router.get('/notifications', controller.getNotifications);
router.patch('/notifications/:id/read', controller.markNotificationRead);
router.patch('/notifications/read-all', controller.markAllNotificationsRead);

module.exports = router;
