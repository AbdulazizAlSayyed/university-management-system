// Mahmoud (Team Lead) — Student routes
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const ctrl = require('./student.controller');

// All student routes are protected — must be logged in as student
router.use(verifyToken, authorize('student'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/courses', ctrl.getCatalog);
router.get('/my-courses', ctrl.getMyCourses);
router.get('/courses/:courseId/classroom', ctrl.getClassroom);
router.post('/enrollments', ctrl.enroll);
router.delete('/enrollments/:courseId', ctrl.drop);
router.get('/enrollments/mine', ctrl.getMyEnrollments);
router.get('/assignments', ctrl.getAssignments);
router.post('/courses/:courseId/calculate-grade', ctrl.calculateGrade);
router.post('/submissions', ctrl.submitAssignment);
router.get('/submissions/mine', ctrl.getMySubmissions);
router.get('/grades', ctrl.getGrades);
router.get('/transcript', ctrl.getTranscript);
router.get('/exams', ctrl.getExams);
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/read-all', ctrl.markAllRead);
router.patch('/notifications/:id/read', ctrl.markRead);
router.get('/users', ctrl.getUsers);
router.get('/all-courses', ctrl.getAllCourses);
router.get('/materials/:id/download', ctrl.downloadMaterial);

module.exports = router;
