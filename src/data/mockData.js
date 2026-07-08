// ============================================================================
//  University Management System — Seed / Mock Data
//  Frontend-only demo. All data lives in memory (see DataContext) and resets
//  on refresh. Relationships use string IDs (e.g. courseId, studentId).
// ============================================================================

export const ROLES = {
  ADMIN: 'admin',
  PROFESSOR: 'professor',
  STUDENT: 'student',
}

export const CURRENT_SEMESTER = 'Fall 2026'

// ----------------------------------------------------------------------------
//  Demo login accounts (shown on the login screen)
// ----------------------------------------------------------------------------
export const DEMO_CREDENTIALS = [
  {
    role: ROLES.ADMIN,
    username: 'admin',
    email: 'admin@university.edu',
    password: 'Admin@123',
    label: 'Administrator',
  },
  {
    role: ROLES.PROFESSOR,
    username: 'j.smith',
    email: 'professor@university.edu',
    password: 'Prof@123',
    label: 'Professor',
  },
  {
    role: ROLES.STUDENT,
    username: 's.jane',
    email: 'student@university.edu',
    password: 'Student@123',
    label: 'Student',
  },
]

// ----------------------------------------------------------------------------
//  Users
// ----------------------------------------------------------------------------
export const users = [
  // --- Admin ---
  {
    id: 'u-admin',
    role: ROLES.ADMIN,
    username: 'admin',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'admin@university.edu',
    password: 'Admin@123',
    phone: '+1 (555) 100-2000',
    status: 'active',
    department: 'Administration',
    title: 'System Administrator',
    avatarColor: 'bg-brand-600',
    createdAt: '2023-01-10',
  },

  // --- Professors ---
  {
    id: 'u-prof-1',
    role: ROLES.PROFESSOR,
    username: 'j.smith',
    firstName: 'James',
    lastName: 'Smith',
    email: 'professor@university.edu',
    password: 'Prof@123',
    phone: '+1 (555) 210-3300',
    status: 'active',
    department: 'Computer Science',
    title: 'Associate Professor',
    avatarColor: 'bg-emerald-600',
    createdAt: '2023-02-01',
  },
  {
    id: 'u-prof-2',
    role: ROLES.PROFESSOR,
    username: 'e.carter',
    firstName: 'Emily',
    lastName: 'Carter',
    email: 'emily.carter@university.edu',
    password: 'Prof@123',
    phone: '+1 (555) 210-3301',
    status: 'active',
    department: 'Computer Science',
    title: 'Professor',
    avatarColor: 'bg-rose-600',
    createdAt: '2022-08-15',
  },
  {
    id: 'u-prof-3',
    role: ROLES.PROFESSOR,
    username: 'r.chen',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.chen@university.edu',
    password: 'Prof@123',
    phone: '+1 (555) 210-3302',
    status: 'active',
    department: 'Mathematics',
    title: 'Assistant Professor',
    avatarColor: 'bg-amber-600',
    createdAt: '2023-09-01',
  },
  {
    id: 'u-prof-4',
    role: ROLES.PROFESSOR,
    username: 'a.khan',
    firstName: 'Aisha',
    lastName: 'Khan',
    email: 'aisha.khan@university.edu',
    password: 'Prof@123',
    phone: '+1 (555) 210-3303',
    status: 'pending',
    department: 'Computer Science',
    title: 'Lecturer',
    avatarColor: 'bg-sky-600',
    createdAt: '2026-06-20',
  },

  // --- Students ---
  {
    id: 'u-stu-1',
    role: ROLES.STUDENT,
    username: 's.jane',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'student@university.edu',
    password: 'Student@123',
    phone: '+1 (555) 320-4400',
    status: 'active',
    studentId: 'STU-2023-0001',
    program: 'BSc Computer Science',
    year: 3,
    avatarColor: 'bg-indigo-600',
    createdAt: '2023-09-05',
  },
  { id: 'u-stu-2', role: ROLES.STUDENT, username: 'm.brown', firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@university.edu', password: 'Student@123', phone: '+1 (555) 320-4401', status: 'active', studentId: 'STU-2023-0002', program: 'BSc Computer Science', year: 3, avatarColor: 'bg-teal-600', createdAt: '2023-09-05' },
  { id: 'u-stu-3', role: ROLES.STUDENT, username: 'o.wilson', firstName: 'Olivia', lastName: 'Wilson', email: 'olivia.wilson@university.edu', password: 'Student@123', phone: '+1 (555) 320-4402', status: 'active', studentId: 'STU-2023-0003', program: 'BSc Computer Science', year: 2, avatarColor: 'bg-fuchsia-600', createdAt: '2024-09-03' },
  { id: 'u-stu-4', role: ROLES.STUDENT, username: 'd.garcia', firstName: 'Daniel', lastName: 'Garcia', email: 'daniel.garcia@university.edu', password: 'Student@123', phone: '+1 (555) 320-4403', status: 'active', studentId: 'STU-2022-0011', program: 'BSc Software Engineering', year: 4, avatarColor: 'bg-orange-600', createdAt: '2022-09-01' },
  { id: 'u-stu-5', role: ROLES.STUDENT, username: 's.martin', firstName: 'Sophia', lastName: 'Martinez', email: 'sophia.martinez@university.edu', password: 'Student@123', phone: '+1 (555) 320-4404', status: 'active', studentId: 'STU-2023-0004', program: 'BSc Computer Science', year: 3, avatarColor: 'bg-cyan-600', createdAt: '2023-09-05' },
  { id: 'u-stu-6', role: ROLES.STUDENT, username: 'w.lee', firstName: 'William', lastName: 'Lee', email: 'william.lee@university.edu', password: 'Student@123', phone: '+1 (555) 320-4405', status: 'active', studentId: 'STU-2024-0008', program: 'BSc Data Science', year: 1, avatarColor: 'bg-violet-600', createdAt: '2025-09-02' },
  { id: 'u-stu-7', role: ROLES.STUDENT, username: 'a.davis', firstName: 'Ava', lastName: 'Davis', email: 'ava.davis@university.edu', password: 'Student@123', phone: '+1 (555) 320-4406', status: 'active', studentId: 'STU-2023-0007', program: 'BSc Computer Science', year: 2, avatarColor: 'bg-pink-600', createdAt: '2024-09-03' },
  { id: 'u-stu-8', role: ROLES.STUDENT, username: 'j.taylor', firstName: 'James', lastName: 'Taylor', email: 'james.taylor@university.edu', password: 'Student@123', phone: '+1 (555) 320-4407', status: 'pending', studentId: 'STU-2026-0021', program: 'BSc Computer Science', year: 1, avatarColor: 'bg-lime-600', createdAt: '2026-06-25' },
  { id: 'u-stu-9', role: ROLES.STUDENT, username: 'i.thomas', firstName: 'Isabella', lastName: 'Thomas', email: 'isabella.thomas@university.edu', password: 'Student@123', phone: '+1 (555) 320-4408', status: 'active', studentId: 'STU-2022-0015', program: 'BSc Software Engineering', year: 4, avatarColor: 'bg-emerald-500', createdAt: '2022-09-01' },
  { id: 'u-stu-10', role: ROLES.STUDENT, username: 'e.moore', firstName: 'Ethan', lastName: 'Moore', email: 'ethan.moore@university.edu', password: 'Student@123', phone: '+1 (555) 320-4409', status: 'inactive', studentId: 'STU-2023-0009', program: 'BSc Computer Science', year: 3, avatarColor: 'bg-slate-500', createdAt: '2023-09-05' },
]

// ----------------------------------------------------------------------------
//  Courses
// ----------------------------------------------------------------------------
export const courses = [
  { id: 'c-cs101', code: 'CS101', name: 'Introduction to Programming', description: 'Fundamentals of programming using Python: variables, control flow, functions, and problem solving.', credits: 3, capacity: 40, professorId: 'u-prof-1', semester: 'Fall 2026', schedule: 'Mon & Wed · 09:00–10:30', room: 'Hall A-101', color: 'bg-brand-500', prerequisites: [], status: 'active' },
  { id: 'c-cs201', code: 'CS201', name: 'Data Structures & Algorithms', description: 'Arrays, linked lists, trees, graphs, sorting and searching, complexity analysis.', credits: 4, capacity: 35, professorId: 'u-prof-1', semester: 'Fall 2026', schedule: 'Tue & Thu · 11:00–12:30', room: 'Hall B-204', color: 'bg-emerald-500', prerequisites: ['c-cs101'], status: 'active' },
  { id: 'c-cs310', code: 'CS310', name: 'Full-Stack Web Development', description: 'Building production web apps with the MERN stack: MongoDB, Express, React, Node.', credits: 3, capacity: 5, professorId: 'u-prof-1', semester: 'Fall 2026', schedule: 'Mon & Wed · 14:00–15:30', room: 'Lab C-12', color: 'bg-indigo-500', prerequisites: ['c-cs201'], status: 'active' },
  { id: 'c-cs301', code: 'CS301', name: 'Database Systems', description: 'Relational and NoSQL databases, data modeling, SQL, indexing, transactions.', credits: 3, capacity: 2, professorId: 'u-prof-2', semester: 'Fall 2026', schedule: 'Tue & Thu · 09:00–10:30', room: 'Hall A-105', color: 'bg-rose-500', prerequisites: ['c-cs101'], status: 'active' },
  { id: 'c-cs220', code: 'CS220', name: 'Operating Systems', description: 'Processes, threads, scheduling, memory management, file systems, concurrency.', credits: 4, capacity: 30, professorId: 'u-prof-2', semester: 'Fall 2026', schedule: 'Mon & Wed · 11:00–12:30', room: 'Hall B-201', color: 'bg-amber-500', prerequisites: ['c-cs201'], status: 'active' },
  { id: 'c-math201', code: 'MATH201', name: 'Linear Algebra', description: 'Vectors, matrices, determinants, eigenvalues, and linear transformations.', credits: 3, capacity: 50, professorId: 'u-prof-3', semester: 'Fall 2026', schedule: 'Tue & Thu · 14:00–15:30', room: 'Hall D-300', color: 'bg-sky-500', prerequisites: [], status: 'active' },
  { id: 'c-cs330', code: 'CS330', name: 'Software Engineering', description: 'Software development life cycle, agile, testing, design patterns, project management.', credits: 3, capacity: 40, professorId: 'u-prof-4', semester: 'Fall 2026', schedule: 'Fri · 09:00–12:00', room: 'Hall A-110', color: 'bg-violet-500', prerequisites: ['c-cs101'], status: 'active' },
  { id: 'c-cs410', code: 'CS410', name: 'Introduction to Machine Learning', description: 'Supervised and unsupervised learning, regression, classification, neural networks.', credits: 4, capacity: 25, professorId: 'u-prof-3', semester: 'Fall 2026', schedule: 'Wed & Fri · 13:00–14:30', room: 'Lab C-15', color: 'bg-teal-500', prerequisites: ['c-cs310'], status: 'active' },
]

// ----------------------------------------------------------------------------
//  Enrollments  (studentId <-> courseId)
// ----------------------------------------------------------------------------
export const enrollments = [
  // Jane Doe (demo student) — 4 courses
  { id: 'e-1', studentId: 'u-stu-1', courseId: 'c-cs101', enrolledAt: '2026-08-20', status: 'enrolled' },
  { id: 'e-2', studentId: 'u-stu-1', courseId: 'c-cs201', enrolledAt: '2026-08-20', status: 'enrolled' },
  { id: 'e-3', studentId: 'u-stu-1', courseId: 'c-cs310', enrolledAt: '2026-08-21', status: 'enrolled' },
  { id: 'e-4', studentId: 'u-stu-1', courseId: 'c-math201', enrolledAt: '2026-08-21', status: 'enrolled' },
  // Others
  { id: 'e-5', studentId: 'u-stu-2', courseId: 'c-cs101', enrolledAt: '2026-08-19', status: 'enrolled' },
  { id: 'e-6', studentId: 'u-stu-2', courseId: 'c-cs201', enrolledAt: '2026-08-19', status: 'enrolled' },
  { id: 'e-7', studentId: 'u-stu-2', courseId: 'c-cs310', enrolledAt: '2026-08-22', status: 'enrolled' },
  { id: 'e-8', studentId: 'u-stu-3', courseId: 'c-cs101', enrolledAt: '2026-08-18', status: 'enrolled' },
  { id: 'e-9', studentId: 'u-stu-3', courseId: 'c-cs301', enrolledAt: '2026-08-18', status: 'enrolled' },
  { id: 'e-10', studentId: 'u-stu-4', courseId: 'c-cs310', enrolledAt: '2026-08-20', status: 'enrolled' },
  { id: 'e-11', studentId: 'u-stu-4', courseId: 'c-cs410', enrolledAt: '2026-08-20', status: 'enrolled' },
  { id: 'e-12', studentId: 'u-stu-5', courseId: 'c-cs201', enrolledAt: '2026-08-21', status: 'enrolled' },
  { id: 'e-13', studentId: 'u-stu-5', courseId: 'c-cs310', enrolledAt: '2026-08-21', status: 'enrolled' },
  { id: 'e-14', studentId: 'u-stu-5', courseId: 'c-math201', enrolledAt: '2026-08-22', status: 'enrolled' },
  { id: 'e-15', studentId: 'u-stu-6', courseId: 'c-cs101', enrolledAt: '2026-08-17', status: 'enrolled' },
  { id: 'e-16', studentId: 'u-stu-7', courseId: 'c-cs101', enrolledAt: '2026-08-19', status: 'enrolled' },
  { id: 'e-17', studentId: 'u-stu-7', courseId: 'c-cs301', enrolledAt: '2026-08-19', status: 'enrolled' },
  { id: 'e-18', studentId: 'u-stu-9', courseId: 'c-cs310', enrolledAt: '2026-08-20', status: 'enrolled' },
  { id: 'e-19', studentId: 'u-stu-9', courseId: 'c-cs410', enrolledAt: '2026-08-20', status: 'enrolled' },
  { id: 'e-20', studentId: 'u-stu-2', courseId: 'c-math201', enrolledAt: '2026-08-23', status: 'enrolled' },
]

// ----------------------------------------------------------------------------
//  Course Materials  (uploaded by professors, organized by week)
// ----------------------------------------------------------------------------
export const materials = [
  { id: 'm-1', courseId: 'c-cs310', week: 'Week 1', title: 'Course Introduction & MERN Overview', type: 'pdf', fileName: 'week1-intro.pdf', size: '2.4 MB', uploadedAt: '2026-09-01', link: null },
  { id: 'm-2', courseId: 'c-cs310', week: 'Week 1', title: 'Setting up Node & React', type: 'pptx', fileName: 'week1-setup.pptx', size: '5.1 MB', uploadedAt: '2026-09-01', link: null },
  { id: 'm-3', courseId: 'c-cs310', week: 'Week 2', title: 'Express Routing & Middleware', type: 'pdf', fileName: 'week2-express.pdf', size: '3.2 MB', uploadedAt: '2026-09-08', link: null },
  { id: 'm-4', courseId: 'c-cs310', week: 'Week 2', title: 'MongoDB Crash Course (video)', type: 'link', fileName: null, size: null, uploadedAt: '2026-09-08', link: 'https://example.com/mongodb-video' },
  { id: 'm-5', courseId: 'c-cs310', week: 'Week 3', title: 'React Components & Hooks', type: 'pdf', fileName: 'week3-react.pdf', size: '4.0 MB', uploadedAt: '2026-09-15', link: null },
  { id: 'm-6', courseId: 'c-cs101', week: 'Week 1', title: 'What is Programming?', type: 'pptx', fileName: 'intro-programming.pptx', size: '3.8 MB', uploadedAt: '2026-09-02', link: null },
  { id: 'm-7', courseId: 'c-cs101', week: 'Week 2', title: 'Variables & Data Types', type: 'pdf', fileName: 'variables.pdf', size: '1.9 MB', uploadedAt: '2026-09-09', link: null },
  { id: 'm-8', courseId: 'c-cs201', week: 'Week 1', title: 'Complexity Analysis (Big-O)', type: 'pdf', fileName: 'big-o.pdf', size: '2.1 MB', uploadedAt: '2026-09-03', link: null },
  { id: 'm-9', courseId: 'c-cs201', week: 'Week 2', title: 'Linked Lists', type: 'pptx', fileName: 'linked-lists.pptx', size: '4.6 MB', uploadedAt: '2026-09-10', link: null },
  { id: 'm-10', courseId: 'c-math201', week: 'Week 1', title: 'Vectors & Vector Spaces', type: 'pdf', fileName: 'vectors.pdf', size: '2.7 MB', uploadedAt: '2026-09-02', link: null },
]

// ----------------------------------------------------------------------------
//  Assignments
// ----------------------------------------------------------------------------
export const assignments = [
  { id: 'a-1', courseId: 'c-cs310', title: 'Build a REST API with Express', description: 'Create a CRUD REST API for a "books" resource using Express and MongoDB. Include validation and error handling.', dueDate: '2026-09-20', maxScore: 100, createdAt: '2026-09-08', attachment: 'api-assignment-brief.pdf' },
  { id: 'a-2', courseId: 'c-cs310', title: 'React To-Do App', description: 'Build a responsive to-do application in React with add, edit, delete, and filter functionality.', dueDate: '2026-10-05', maxScore: 100, createdAt: '2026-09-15', attachment: null },
  { id: 'a-3', courseId: 'c-cs310', title: 'Final MERN Project', description: 'Design and build a complete full-stack application of your choice using the MERN stack.', dueDate: '2026-12-10', maxScore: 100, createdAt: '2026-09-20', attachment: 'final-project-rubric.pdf' },
  { id: 'a-4', courseId: 'c-cs101', title: 'Problem Set 1: Loops & Conditionals', description: 'Solve 8 programming problems using loops and conditional statements.', dueDate: '2026-09-18', maxScore: 50, createdAt: '2026-09-09', attachment: 'pset1.pdf' },
  { id: 'a-5', courseId: 'c-cs101', title: 'Problem Set 2: Functions', description: 'Write reusable functions to solve the provided problems.', dueDate: '2026-10-02', maxScore: 50, createdAt: '2026-09-16', attachment: null },
  { id: 'a-6', courseId: 'c-cs201', title: 'Implement a Linked List', description: 'Implement a singly linked list class with insert, delete, and search operations.', dueDate: '2026-09-25', maxScore: 100, createdAt: '2026-09-10', attachment: null },
  { id: 'a-7', courseId: 'c-math201', title: 'Matrix Operations Worksheet', description: 'Complete the worksheet on matrix multiplication and determinants.', dueDate: '2026-09-22', maxScore: 40, createdAt: '2026-09-08', attachment: 'matrix-worksheet.pdf' },
]

// ----------------------------------------------------------------------------
//  Submissions  (student submissions to assignments)
//  status: submitted | graded | missing (missing rows are implicit; we list real submissions)
// ----------------------------------------------------------------------------
export const submissions = [
  // Jane Doe
  { id: 's-1', assignmentId: 'a-1', studentId: 'u-stu-1', submittedAt: '2026-09-19', fileName: 'jane-rest-api.zip', status: 'graded', score: 92, feedback: 'Excellent work! Clean route structure. Consider adding pagination next time.' },
  { id: 's-2', assignmentId: 'a-4', studentId: 'u-stu-1', submittedAt: '2026-09-17', fileName: 'jane-pset1.pdf', status: 'graded', score: 47, feedback: 'Great job — problem 6 could be optimized.' },
  { id: 's-3', assignmentId: 'a-6', studentId: 'u-stu-1', submittedAt: '2026-09-24', fileName: 'jane-linkedlist.py', status: 'graded', score: 88, feedback: 'Solid implementation. Delete edge case for head node was handled well.' },
  { id: 's-4', assignmentId: 'a-2', studentId: 'u-stu-1', submittedAt: '2026-10-04', fileName: 'jane-todo.zip', status: 'submitted', score: null, feedback: null },
  { id: 's-5', assignmentId: 'a-7', studentId: 'u-stu-1', submittedAt: '2026-09-21', fileName: 'jane-matrix.pdf', status: 'graded', score: 36, feedback: 'Well done.' },
  // Others (for professor grading views)
  { id: 's-6', assignmentId: 'a-1', studentId: 'u-stu-2', submittedAt: '2026-09-20', fileName: 'michael-rest-api.zip', status: 'graded', score: 85, feedback: 'Good, but missing input validation on POST.' },
  { id: 's-7', assignmentId: 'a-1', studentId: 'u-stu-4', submittedAt: '2026-09-20', fileName: 'daniel-rest-api.zip', status: 'submitted', score: null, feedback: null },
  { id: 's-8', assignmentId: 'a-1', studentId: 'u-stu-5', submittedAt: '2026-09-18', fileName: 'sophia-rest-api.zip', status: 'submitted', score: null, feedback: null },
  { id: 's-9', assignmentId: 'a-1', studentId: 'u-stu-9', submittedAt: '2026-09-21', fileName: 'isabella-rest-api.zip', status: 'submitted', score: null, feedback: null },
  { id: 's-10', assignmentId: 'a-2', studentId: 'u-stu-2', submittedAt: '2026-10-03', fileName: 'michael-todo.zip', status: 'submitted', score: null, feedback: null },
  { id: 's-11', assignmentId: 'a-4', studentId: 'u-stu-2', submittedAt: '2026-09-18', fileName: 'michael-pset1.pdf', status: 'graded', score: 44, feedback: 'Nice work.' },
  { id: 's-12', assignmentId: 'a-6', studentId: 'u-stu-2', submittedAt: '2026-09-25', fileName: 'michael-linkedlist.py', status: 'submitted', score: null, feedback: null },
  { id: 's-13', assignmentId: 'a-6', studentId: 'u-stu-5', submittedAt: '2026-09-24', fileName: 'sophia-linkedlist.py', status: 'submitted', score: null, feedback: null },
]

// ----------------------------------------------------------------------------
//  Final Grades  (per student, per course)
// ----------------------------------------------------------------------------
export const grades = [
  // Jane Doe — some completed (prior term style) + current
  { id: 'g-1', studentId: 'u-stu-1', courseId: 'c-cs101', letter: 'A', points: 4.0, score: 94, status: 'final' },
  { id: 'g-2', studentId: 'u-stu-1', courseId: 'c-cs201', letter: 'A-', points: 3.7, score: 90, status: 'final' },
  { id: 'g-3', studentId: 'u-stu-1', courseId: 'c-cs310', letter: null, points: null, score: null, status: 'in-progress' },
  { id: 'g-4', studentId: 'u-stu-1', courseId: 'c-math201', letter: 'B+', points: 3.3, score: 87, status: 'final' },
  // Others
  { id: 'g-5', studentId: 'u-stu-2', courseId: 'c-cs101', letter: 'B+', points: 3.3, score: 86, status: 'final' },
  { id: 'g-6', studentId: 'u-stu-2', courseId: 'c-cs201', letter: 'B', points: 3.0, score: 83, status: 'final' },
  { id: 'g-7', studentId: 'u-stu-2', courseId: 'c-cs310', letter: null, points: null, score: null, status: 'in-progress' },
  { id: 'g-8', studentId: 'u-stu-4', courseId: 'c-cs310', letter: null, points: null, score: null, status: 'in-progress' },
  { id: 'g-9', studentId: 'u-stu-5', courseId: 'c-cs201', letter: null, points: null, score: null, status: 'in-progress' },
  { id: 'g-10', studentId: 'u-stu-5', courseId: 'c-cs310', letter: null, points: null, score: null, status: 'in-progress' },
]

// ----------------------------------------------------------------------------
//  Exams
// ----------------------------------------------------------------------------
export const exams = [
  { id: 'x-1', courseId: 'c-cs101', title: 'CS101 Midterm', date: '2026-10-20', startTime: '09:00', endTime: '11:00', room: 'Exam Hall 1', type: 'Midterm' },
  { id: 'x-2', courseId: 'c-cs201', title: 'CS201 Midterm', date: '2026-10-22', startTime: '11:00', endTime: '13:00', room: 'Exam Hall 2', type: 'Midterm' },
  { id: 'x-3', courseId: 'c-cs310', title: 'CS310 Midterm', date: '2026-10-24', startTime: '14:00', endTime: '16:00', room: 'Lab C-12', type: 'Midterm' },
  { id: 'x-4', courseId: 'c-math201', title: 'MATH201 Midterm', date: '2026-10-27', startTime: '10:00', endTime: '12:00', room: 'Exam Hall 3', type: 'Midterm' },
  { id: 'x-5', courseId: 'c-cs101', title: 'CS101 Final Exam', date: '2026-12-15', startTime: '09:00', endTime: '12:00', room: 'Exam Hall 1', type: 'Final' },
  { id: 'x-6', courseId: 'c-cs201', title: 'CS201 Final Exam', date: '2026-12-17', startTime: '09:00', endTime: '12:00', room: 'Exam Hall 2', type: 'Final' },
  { id: 'x-7', courseId: 'c-cs310', title: 'CS310 Final Exam', date: '2026-12-19', startTime: '13:00', endTime: '16:00', room: 'Lab C-12', type: 'Final' },
  { id: 'x-8', courseId: 'c-math201', title: 'MATH201 Final Exam', date: '2026-12-21', startTime: '09:00', endTime: '12:00', room: 'Exam Hall 3', type: 'Final' },
]

// ----------------------------------------------------------------------------
//  Announcements  (scope: 'system' visible to all, or 'course' for a course)
// ----------------------------------------------------------------------------
export const announcements = [
  { id: 'an-1', scope: 'system', courseId: null, authorId: 'u-admin', title: 'Fall 2026 Registration Deadline', body: 'Course registration for the Fall 2026 semester closes on September 5, 2026. Please finalize your enrollments before the deadline.', createdAt: '2026-08-28', pinned: true },
  { id: 'an-2', scope: 'system', courseId: null, authorId: 'u-admin', title: 'Campus Maintenance Notice', body: 'The library will be closed for maintenance on Saturday, September 14. Online resources remain available.', createdAt: '2026-09-05', pinned: false },
  { id: 'an-3', scope: 'system', courseId: null, authorId: 'u-admin', title: 'Midterm Exam Schedule Published', body: 'The midterm examination timetable is now available. Check your exam timetable for dates and rooms.', createdAt: '2026-10-01', pinned: false },
  { id: 'an-4', scope: 'course', courseId: 'c-cs310', authorId: 'u-prof-1', title: 'Welcome to Full-Stack Web Development', body: 'Welcome everyone! Please install Node.js 20+ and VS Code before our first lab. Materials for Week 1 are uploaded.', createdAt: '2026-09-01', pinned: true },
  { id: 'an-5', scope: 'course', courseId: 'c-cs310', authorId: 'u-prof-1', title: 'Assignment 1 Extended', body: 'Due to popular request, the REST API assignment deadline is extended to September 20.', createdAt: '2026-09-14', pinned: false },
  { id: 'an-6', scope: 'course', courseId: 'c-cs101', authorId: 'u-prof-1', title: 'Lab Session Room Change', body: 'This week’s lab will be held in Hall A-102 instead of the usual room.', createdAt: '2026-09-11', pinned: false },
]

// ----------------------------------------------------------------------------
//  Attendance  (per course session)
//  records: { studentId, present: boolean }
// ----------------------------------------------------------------------------
export const attendance = [
  {
    id: 'att-1', courseId: 'c-cs310', date: '2026-09-01', topic: 'Course Intro',
    records: [
      { studentId: 'u-stu-1', present: true },
      { studentId: 'u-stu-2', present: true },
      { studentId: 'u-stu-4', present: false },
      { studentId: 'u-stu-5', present: true },
      { studentId: 'u-stu-9', present: true },
    ],
  },
  {
    id: 'att-2', courseId: 'c-cs310', date: '2026-09-08', topic: 'Express Routing',
    records: [
      { studentId: 'u-stu-1', present: true },
      { studentId: 'u-stu-2', present: false },
      { studentId: 'u-stu-4', present: true },
      { studentId: 'u-stu-5', present: true },
      { studentId: 'u-stu-9', present: true },
    ],
  },
  {
    id: 'att-3', courseId: 'c-cs101', date: '2026-09-02', topic: 'What is Programming?',
    records: [
      { studentId: 'u-stu-1', present: true },
      { studentId: 'u-stu-2', present: true },
      { studentId: 'u-stu-3', present: true },
      { studentId: 'u-stu-6', present: false },
      { studentId: 'u-stu-7', present: true },
    ],
  },
]

// ----------------------------------------------------------------------------
//  Notifications  (per user)
// ----------------------------------------------------------------------------
export const notifications = [
  { id: 'n-1', userId: 'u-stu-1', type: 'grade', title: 'New grade posted', body: 'Your grade for "Build a REST API" is available: 92/100.', createdAt: '2026-09-22T10:15:00', read: false, link: '/student/grades' },
  { id: 'n-2', userId: 'u-stu-1', type: 'assignment', title: 'New assignment', body: 'CS310: "Final MERN Project" is due Dec 10.', createdAt: '2026-09-20T09:00:00', read: false, link: '/student/assignments' },
  { id: 'n-3', userId: 'u-stu-1', type: 'material', title: 'New material uploaded', body: 'CS310: "React Components & Hooks" is now available.', createdAt: '2026-09-15T14:30:00', read: true, link: '/student/courses/c-cs310?tab=materials' },
  { id: 'n-4', userId: 'u-stu-1', type: 'announcement', title: 'Course announcement', body: 'CS310: Assignment 1 deadline extended to September 20.', createdAt: '2026-09-14T08:00:00', read: true, link: '/student/courses/c-cs310?tab=announcements' },
  { id: 'n-5', userId: 'u-prof-1', type: 'submission', title: 'New submission', body: 'Daniel Garcia submitted "Build a REST API".', createdAt: '2026-09-20T16:45:00', read: false, link: '/professor/grading' },
  { id: 'n-6', userId: 'u-prof-1', type: 'submission', title: 'New submission', body: 'Sophia Martinez submitted "Build a REST API".', createdAt: '2026-09-18T12:10:00', read: false, link: '/professor/grading' },
  { id: 'n-7', userId: 'u-prof-1', type: 'announcement', title: 'System announcement', body: 'Midterm exam schedule has been published.', createdAt: '2026-10-01T09:00:00', read: true, link: '/professor/dashboard' },
  { id: 'n-8', userId: 'u-admin', type: 'system', title: 'New account pending', body: 'Aisha Khan (Professor) is awaiting activation.', createdAt: '2026-06-20T11:00:00', read: false, link: '/admin/users' },
  { id: 'n-9', userId: 'u-admin', type: 'system', title: 'New account pending', body: 'James Taylor (Student) is awaiting activation.', createdAt: '2026-06-25T13:20:00', read: false, link: '/admin/users' },
]

// ----------------------------------------------------------------------------
//  Academic Calendar
// ----------------------------------------------------------------------------
export const calendarEvents = [
  { id: 'cal-1', title: 'Fall 2026 Semester Begins', date: '2026-09-01', type: 'semester' },
  { id: 'cal-2', title: 'Registration Deadline', date: '2026-09-05', type: 'deadline' },
  { id: 'cal-3', title: 'Add/Drop Deadline', date: '2026-09-12', type: 'deadline' },
  { id: 'cal-4', title: 'Midterm Examinations', date: '2026-10-20', type: 'exam' },
  { id: 'cal-5', title: 'Fall Break', date: '2026-11-25', type: 'holiday' },
  { id: 'cal-6', title: 'Final Examinations', date: '2026-12-15', type: 'exam' },
  { id: 'cal-7', title: 'Semester Ends', date: '2026-12-22', type: 'semester' },
]

// ----------------------------------------------------------------------------
//  Audit Log
// ----------------------------------------------------------------------------
export const auditLogs = [
  { id: 'log-1', actorId: 'u-admin', action: 'create', entity: 'User', detail: 'Created student account "James Taylor"', timestamp: '2026-06-25T13:18:00' },
  { id: 'log-2', actorId: 'u-admin', action: 'create', entity: 'Course', detail: 'Created course CS410 — Introduction to Machine Learning', timestamp: '2026-06-22T10:05:00' },
  { id: 'log-3', actorId: 'u-admin', action: 'update', entity: 'Course', detail: 'Assigned Dr. James Smith to CS310', timestamp: '2026-06-21T15:40:00' },
  { id: 'log-4', actorId: 'u-prof-1', action: 'create', entity: 'Assignment', detail: 'Created assignment "Final MERN Project" in CS310', timestamp: '2026-09-20T09:00:00' },
  { id: 'log-5', actorId: 'u-prof-1', action: 'update', entity: 'Grade', detail: 'Graded submission for "Build a REST API" (Jane Doe)', timestamp: '2026-09-22T10:12:00' },
  { id: 'log-6', actorId: 'u-admin', action: 'update', entity: 'User', detail: 'Deactivated account "Ethan Moore"', timestamp: '2026-05-30T14:00:00' },
  { id: 'log-7', actorId: 'u-admin', action: 'create', entity: 'Announcement', detail: 'Posted system announcement "Midterm Exam Schedule Published"', timestamp: '2026-10-01T09:00:00' },
]

// GPA scale for reference
export const GRADE_SCALE = [
  { letter: 'A', min: 93, points: 4.0 },
  { letter: 'A-', min: 90, points: 3.7 },
  { letter: 'B+', min: 87, points: 3.3 },
  { letter: 'B', min: 83, points: 3.0 },
  { letter: 'B-', min: 80, points: 2.7 },
  { letter: 'C+', min: 77, points: 2.3 },
  { letter: 'C', min: 73, points: 2.0 },
  { letter: 'C-', min: 70, points: 1.7 },
  { letter: 'D', min: 60, points: 1.0 },
  { letter: 'F', min: 0, points: 0.0 },
]
