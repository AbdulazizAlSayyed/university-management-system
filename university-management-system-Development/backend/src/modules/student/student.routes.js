// Student routes - mounted at /api/student  (protected: verifyToken + authorize("student"))
// Catalog:      GET /catalog , POST /enrollments , DELETE /enrollments/:courseId (enroll/drop)
// Courses:      GET /courses , GET /courses/:id (classroom: materials + announcements)
// Assignments:  GET /assignments , POST /assignments/:id/submit
// Grades:       GET /grades (per course + GPA)
// Transcript:   GET /transcript
// Exams:        GET /exams (personal timetable)
// Notifications:GET /notifications , PATCH /notifications/:id/read
// Dashboard:    GET /dashboard
