const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const controller = require('./student.controller');

router.use(verifyToken, authorize('student'));

router.get('/dashboard', controller.getDashboard);
router.get('/courses', controller.getCatalog);
router.post('/enrollments', controller.enroll);
router.delete('/enrollments/:courseId', controller.drop);
router.get('/my-courses', controller.getMyCourses);
router.get('/courses/:courseId/classroom', controller.getClassroom);
router.get('/assignments', controller.getAssignments);
router.post('/submissions', controller.submitAssignment);
router.get('/grades', controller.getGrades);
router.post('/courses/:courseId/calculate-grade', controller.calculateGrade);
router.get('/transcript', controller.getTranscript);
router.get('/exams', controller.getExams);
router.get('/notifications', controller.getNotifications);
router.patch('/notifications/:id/read', controller.markNotificationRead);
router.patch('/notifications/read-all', controller.markAllNotificationsRead);
router.get('/users', controller.getUsers);
router.get('/all-courses', controller.getAllCourses);
router.get('/enrollments', controller.getEnrollments);

module.exports = router;
