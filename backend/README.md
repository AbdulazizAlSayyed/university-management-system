# UMS Backend (Node.js + Express + MongoDB)

REST API for the University Management System. Scaffold only - each file has a
short TODO comment describing its purpose. The API is split by ROLE.

## Getting started

1. cd backend
2. npm install
3. copy .env.example to .env and fill in the values
4. npm run dev   (nodemon on http://localhost:5000)

## Structure (role-based modules)

src/
  config/        env config + MongoDB connection
  models/        SHARED Mongoose schemas (User, Course, Enrollment, Assignment,
                 Submission, Grade, Exam, Announcement, Attendance, Material,
                 Notification, AuditLog) - shared because all roles use the same data
  middleware/    auth (JWT), role (RBAC), validate, error, notFound
  utils/         ApiError, asyncHandler, generateToken, logger
  routes/
    index.js     mounts /api/auth, /api/admin, /api/professor, /api/student
  modules/
    auth/        shared login/register/me/password  (all roles)
    admin/       users, courses, enrollment, exams, calendar, announcements, audit, stats
    professor/   courses, materials, assignments, grading, grades, attendance, announcements
    student/     catalog, enrollment, classroom, submissions, grades, transcript, exams, notifications

## How the role split works

- Every request first passes verifyToken (reads the JWT).
- Then authorize("admin" | "professor" | "student") guards each role module.
- Shared data lives in models/ ; role modules hold only that role's endpoints + logic.
