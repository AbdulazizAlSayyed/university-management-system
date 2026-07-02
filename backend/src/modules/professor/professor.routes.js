// Professor routes - mounted at /api/professor  (protected: verifyToken + authorize("professor"))
// Courses:      GET /courses (assigned) , GET /courses/:id (roster)
// Materials:    POST/GET/DELETE /courses/:id/materials
// Assignments:  POST/GET/DELETE /courses/:id/assignments
// Submissions:  GET /submissions , PATCH /submissions/:id/grade (score + feedback)
// Final grades: PUT /courses/:id/grades
// Attendance:   POST/GET /courses/:id/attendance
// Announcements:POST/GET/DELETE /courses/:id/announcements
// Dashboard:    GET /dashboard
