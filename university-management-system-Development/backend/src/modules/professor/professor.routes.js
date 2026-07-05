// Professor routes - mounted at /api/professor
// Courses:      GET /courses (assigned) , GET /courses/:id (roster)
// Materials:    POST/GET/DELETE /courses/:id/materials
// Assignments:  POST/GET/DELETE /courses/:id/assignments
// Submissions:  GET /submissions , PATCH /submissions/:id/grade (score + feedback)
// Final grades: PUT /courses/:id/grades
// Attendance:   POST/GET /courses/:id/attendance
// Announcements:POST/GET/DELETE /courses/:id/announcements
// Dashboard:    GET /dashboard

const express = require('express');
const router = express.Router();
const professorController = require('./professor.controller');

// Import default exported middleware functions directly
const verifyToken = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');

// Secure all professor endpoints
router.use(verifyToken);
router.use(authorize('professor'));

router.get('/dashboard', professorController.getDashboardOverview);
router.get('/courses', professorController.getAssignedCourses);

module.exports = router;