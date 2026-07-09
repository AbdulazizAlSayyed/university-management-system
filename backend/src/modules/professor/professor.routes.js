const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const controller = require('./professor.controller');

router.use(verifyToken, authorize('professor'));

router.get('/dashboard', controller.getDashboard);
router.get('/courses', controller.getCourses);
router.get('/courses/:courseId', controller.getCourseDetail);

router.get('/courses/:courseId/materials', controller.getMaterials);
router.post('/courses/:courseId/materials', controller.addMaterial);
router.delete('/courses/:courseId/materials/:materialId', controller.deleteMaterial);

router.get('/courses/:courseId/announcements', controller.getCourseAnnouncements);
router.post('/courses/:courseId/announcements', controller.addAnnouncement);
router.delete('/announcements/:id', controller.deleteAnnouncement);

router.get('/courses/:courseId/assignments', controller.getCourseAssignments);
router.post('/courses/:courseId/assignments', controller.addAssignment);
router.delete('/assignments/:id', controller.deleteAssignment);

router.get('/submissions', controller.getSubmissions);
router.patch('/submissions/:id/grade', controller.gradeSubmission);

router.get('/courses/:courseId/grades', controller.getCourseGrades);
router.put('/courses/:courseId/grades', controller.setFinalGrade);

router.get('/attendance', controller.getAttendance);
router.get('/courses/:courseId/attendance', controller.getCourseAttendance);
router.post('/courses/:courseId/attendance', controller.saveAttendance);

router.get('/assignments', controller.getAssignments);
router.get('/announcements', controller.getAnnouncements);
router.get('/users', controller.getUsers);
router.get('/enrollments', controller.getEnrollments);

router.get('/notifications', controller.getNotifications);
router.patch('/notifications/:id/read', controller.markNotificationRead);
router.patch('/notifications/read-all', controller.markAllNotificationsRead);

module.exports = router;
