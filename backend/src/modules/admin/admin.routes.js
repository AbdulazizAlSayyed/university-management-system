<<<<<<< HEAD
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
=======
import { Router } from 'express'
import * as c from './admin.controller.js'

const router = Router()

// Dashboard
router.get('/dashboard/stats', c.dashboard)

// User management
router.get('/users', c.listUsers)
router.post('/users', c.createUser)
router.get('/users/:id', c.getUser)
router.put('/users/:id', c.updateUser)
router.delete('/users/:id', c.deleteUser)
router.patch('/users/:id/status', c.setUserStatus)

// Course management
router.get('/courses', c.listCourses)
router.post('/courses', c.createCourse)
router.put('/courses/:id', c.updateCourse)
router.delete('/courses/:id', c.deleteCourse)
router.get('/courses/:id/roster', c.getRoster)

// Enrollment
router.post('/enrollments', c.enroll)
router.delete('/enrollments', c.drop)

// Exams
router.get('/exams', c.listExams)
router.post('/exams', c.createExam)
router.put('/exams/:id', c.updateExam)
router.delete('/exams/:id', c.deleteExam)

// Academic calendar
router.get('/calendar', c.listCalendar)
router.post('/calendar', c.createEvent)
router.delete('/calendar/:id', c.deleteEvent)

// System announcements
router.get('/announcements', c.listAnnouncements)
router.post('/announcements', c.createAnnouncement)
router.delete('/announcements/:id', c.deleteAnnouncement)

// Audit log
router.get('/audit', c.listAudit)

export default router
>>>>>>> Development
