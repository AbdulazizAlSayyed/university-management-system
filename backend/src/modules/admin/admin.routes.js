// Admin routes - mounted at /api/admin  (protected: verifyToken + authorize("admin"))
// Users:        GET/POST/PUT/DELETE /users , PATCH /users/:id/status (activate/deactivate)
// Courses:      GET/POST/PUT/DELETE /courses (create + assign professor + capacity)
// Enrollment:   POST /enrollments , DELETE /enrollments (enroll / remove students)
// Exams:        GET/POST/PUT/DELETE /exams
// Calendar:     GET/POST/DELETE /calendar
// Announcements:GET/POST/DELETE /announcements (system-wide)
// Audit log:    GET /audit
// Dashboard:    GET /dashboard/stats
