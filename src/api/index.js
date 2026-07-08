// Mahmoud (Team Lead) — API service layer. Each page has its own endpoint.
import client from './client'
export { client }

// ----- Auth -----
export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }).then((r) => r.data),
  updateProfile: (data) => client.patch('/auth/profile', data).then((r) => r.data),
}

// ----- Student API (all under /api/student) -----
export const studentApi = {
  // Dashboard
  getDashboard: () => client.get('/student/dashboard').then((r) => r.data),
  // Catalog
  getCatalog: () => client.get('/student/courses').then((r) => r.data),
  enroll: (courseId) => client.post('/student/enrollments', { courseId }).then((r) => r.data),
  drop: (courseId) => client.delete(`/student/enrollments/${courseId}`).then((r) => r.data),
  // My Courses
  getMyCourses: () => client.get('/student/my-courses').then((r) => r.data),
  // Classroom
  getClassroom: (courseId) => client.get(`/student/courses/${courseId}/classroom`).then((r) => r.data),
  // Assignments
  getAssignments: () => client.get('/student/assignments').then((r) => r.data),
  submitAssignment: (assignmentId, fileName) => client.post('/student/submissions', { assignmentId, fileName }).then((r) => r.data),
  // Grades
  getGrades: () => client.get('/student/grades').then((r) => r.data),
  calculateGrade: (courseId) => client.post(`/student/courses/${courseId}/calculate-grade`).then((r) => r.data),
  // Transcript
  getTranscript: () => client.get('/student/transcript').then((r) => r.data),
  // Exams
  getExams: () => client.get('/student/exams').then((r) => r.data),
  // Notifications
  getNotifications: () => client.get('/student/notifications').then((r) => r.data),
  markNotificationRead: (id) => client.patch(`/student/notifications/${id}/read`).then((r) => r.data),
  markAllNotificationsRead: () => client.patch('/student/notifications/read-all').then((r) => r.data),
  // Shared data
  getUsers: () => client.get('/student/users').then((r) => r.data),
  getAllCourses: () => client.get('/student/all-courses').then((r) => r.data),
}
