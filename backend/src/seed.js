import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import User from './models/User.js'
import Course from './models/Course.js'
import Enrollment from './models/Enrollment.js'
import Grade from './models/Grade.js'
import Exam from './models/Exam.js'
import Announcement from './models/Announcement.js'
import CalendarEvent from './models/CalendarEvent.js'
import AuditLog from './models/AuditLog.js'
import Notification from './models/Notification.js'

async function seed() {
  await connectDB()
  console.log('Clearing collections...')
  await Promise.all([
    User.deleteMany({}), Course.deleteMany({}), Enrollment.deleteMany({}), Grade.deleteMany({}),
    Exam.deleteMany({}), Announcement.deleteMany({}), CalendarEvent.deleteMany({}), AuditLog.deleteMany({}), Notification.deleteMany({}),
  ])

  // --- Users (password hashed by the model pre-save hook) ---
  const admin = await User.create({ firstName: 'Sarah', lastName: 'Johnson', email: 'admin@university.edu', password: 'Admin@123', role: 'admin', status: 'active', username: 'admin', avatarColor: 'bg-brand-600' })
  const profSmith = await User.create({ firstName: 'James', lastName: 'Smith', email: 'professor@university.edu', password: 'Prof@123', role: 'professor', status: 'active', username: 'j.smith', department: 'Computer Science', title: 'Associate Professor', avatarColor: 'bg-emerald-600' })
  const profCarter = await User.create({ firstName: 'Emily', lastName: 'Carter', email: 'emily.carter@university.edu', password: 'Prof@123', role: 'professor', status: 'active', username: 'e.carter', department: 'Computer Science', title: 'Professor', avatarColor: 'bg-rose-600' })

  const studentsData = [
    { firstName: 'Jane', lastName: 'Doe', email: 'student@university.edu', password: 'Student@123', username: 's.jane', studentId: 'STU-2023-0001', program: 'BSc Computer Science', year: 3, status: 'active', avatarColor: 'bg-indigo-600' },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@university.edu', password: 'Student@123', username: 'm.brown', studentId: 'STU-2023-0002', program: 'BSc Computer Science', year: 3, status: 'active', avatarColor: 'bg-teal-600' },
    { firstName: 'Olivia', lastName: 'Wilson', email: 'olivia.wilson@university.edu', password: 'Student@123', username: 'o.wilson', studentId: 'STU-2024-0003', program: 'BSc Computer Science', year: 2, status: 'active', avatarColor: 'bg-fuchsia-600' },
    { firstName: 'Daniel', lastName: 'Garcia', email: 'daniel.garcia@university.edu', password: 'Student@123', username: 'd.garcia', studentId: 'STU-2022-0011', program: 'BSc Software Engineering', year: 4, status: 'active', avatarColor: 'bg-orange-600' },
    { firstName: 'James', lastName: 'Taylor', email: 'james.taylor@university.edu', password: 'Student@123', username: 'j.taylor', studentId: 'STU-2026-0021', program: 'BSc Computer Science', year: 1, status: 'pending', avatarColor: 'bg-lime-600' },
  ]
  const students = []
  for (const s of studentsData) students.push(await User.create({ ...s, role: 'student' }))

  // --- Courses ---
  const coursesData = [
    { code: 'CS101', name: 'Introduction to Programming', description: 'Fundamentals of programming using Python.', credits: 3, capacity: 40, professorId: profSmith._id, schedule: 'Mon & Wed - 09:00-10:30', room: 'Hall A-101', color: 'bg-brand-500' },
    { code: 'CS201', name: 'Data Structures & Algorithms', description: 'Arrays, linked lists, trees, graphs, complexity.', credits: 4, capacity: 35, professorId: profSmith._id, schedule: 'Tue & Thu - 11:00-12:30', room: 'Hall B-204', color: 'bg-emerald-500' },
    { code: 'CS310', name: 'Full-Stack Web Development', description: 'Building web apps with the MERN stack.', credits: 3, capacity: 3, professorId: profSmith._id, schedule: 'Mon & Wed - 14:00-15:30', room: 'Lab C-12', color: 'bg-indigo-500' },
    { code: 'CS301', name: 'Database Systems', description: 'Relational and NoSQL databases, SQL, indexing.', credits: 3, capacity: 35, professorId: profCarter._id, schedule: 'Tue & Thu - 09:00-10:30', room: 'Hall A-105', color: 'bg-rose-500' },
    { code: 'CS220', name: 'Operating Systems', description: 'Processes, threads, scheduling, memory.', credits: 4, capacity: 30, professorId: profCarter._id, schedule: 'Mon & Wed - 11:00-12:30', room: 'Hall B-201', color: 'bg-amber-500' },
  ]
  const courses = []
  for (const c of coursesData) courses.push(await Course.create(c))
  const byCode = Object.fromEntries(courses.map((c) => [c.code, c]))

  // --- Prerequisites (CS101 -> CS201 -> CS310/CS220, CS101 -> CS301) ---
  byCode.CS201.prerequisites = [byCode.CS101._id]
  byCode.CS310.prerequisites = [byCode.CS201._id]
  byCode.CS301.prerequisites = [byCode.CS101._id]
  byCode.CS220.prerequisites = [byCode.CS201._id]
  await Promise.all([byCode.CS201.save(), byCode.CS310.save(), byCode.CS301.save(), byCode.CS220.save()])

  // --- Final grades from previous semesters (used for prerequisite checks) ---
  const finalGrade = (student, course, score, letter, points) =>
    Grade.create({ studentId: student._id, courseId: course._id, score, letter, points, status: 'final' })
  await finalGrade(students[0], byCode.CS101, 94, 'A', 4.0)   // Jane
  await finalGrade(students[0], byCode.CS201, 90, 'A-', 3.7)
  await finalGrade(students[1], byCode.CS101, 86, 'B+', 3.3)  // Michael
  await finalGrade(students[1], byCode.CS201, 83, 'B', 3.0)
  await finalGrade(students[2], byCode.CS101, 81, 'B', 3.0)   // Olivia
  await finalGrade(students[3], byCode.CS101, 92, 'A', 4.0)   // Daniel
  await finalGrade(students[3], byCode.CS201, 88, 'B+', 3.3)

  // --- Enrollments (consistent with grades/prerequisites; CS310 is FULL: 3/3) ---
  const enroll = (student, course) => Enrollment.create({ studentId: student._id, courseId: course._id, status: 'enrolled' })
  await enroll(students[0], byCode.CS310)
  await enroll(students[0], byCode.CS301)
  await enroll(students[1], byCode.CS310)
  await enroll(students[1], byCode.CS220)
  await enroll(students[2], byCode.CS201)
  await enroll(students[2], byCode.CS301)
  await enroll(students[3], byCode.CS310)
  await enroll(students[3], byCode.CS220)
  await enroll(students[4], byCode.CS101)

  // --- Exams ---
  await Exam.create([
    { courseId: byCode.CS101._id, title: 'CS101 Midterm', type: 'Midterm', date: new Date('2026-10-20'), startTime: '09:00', endTime: '11:00', room: 'Exam Hall 1' },
    { courseId: byCode.CS201._id, title: 'CS201 Midterm', type: 'Midterm', date: new Date('2026-10-22'), startTime: '11:00', endTime: '13:00', room: 'Exam Hall 2' },
    { courseId: byCode.CS310._id, title: 'CS310 Final Exam', type: 'Final', date: new Date('2026-12-19'), startTime: '13:00', endTime: '16:00', room: 'Lab C-12' },
  ])

  // --- System announcements ---
  await Announcement.create([
    { scope: 'system', authorId: admin._id, title: 'Fall 2026 Registration Deadline', body: 'Course registration closes on September 5, 2026.', pinned: true },
    { scope: 'system', authorId: admin._id, title: 'Midterm Exam Schedule Published', body: 'The midterm timetable is now available.', pinned: false },
  ])

  // --- Academic calendar ---
  await CalendarEvent.create([
    { title: 'Fall 2026 Semester Begins', date: new Date('2026-09-01'), type: 'semester' },
    { title: 'Registration Deadline', date: new Date('2026-09-05'), type: 'deadline' },
    { title: 'Midterm Examinations', date: new Date('2026-10-20'), type: 'exam' },
    { title: 'Fall Break', date: new Date('2026-11-25'), type: 'holiday' },
    { title: 'Final Examinations', date: new Date('2026-12-15'), type: 'exam' },
  ])

  // --- Seed a couple of audit entries ---
  await AuditLog.create([
    { actorId: admin._id, action: 'create', entity: 'Course', detail: 'Created course CS310 - Full-Stack Web Development' },
    { actorId: admin._id, action: 'update', entity: 'User', detail: 'Activated account "Jane Doe"' },
  ])

  // Notifications for the admin (so the bell shows real data)
  await Notification.create([
    { userId: admin._id, type: 'system', title: 'Welcome to UniHub', body: 'Your administrator account is ready.', link: '/admin/dashboard' },
    { userId: admin._id, type: 'system', title: 'Accounts pending activation', body: 'There are accounts awaiting your approval.', link: '/admin/users' },
  ])

  console.log('Seed complete:')
  console.log('  users:', await User.countDocuments())
  console.log('  courses:', await Course.countDocuments())
  console.log('  enrollments:', await Enrollment.countDocuments())
  console.log('  grades:', await Grade.countDocuments())
  console.log('  exams:', await Exam.countDocuments())
  console.log('  announcements:', await Announcement.countDocuments())
  console.log('  calendar events:', await CalendarEvent.countDocuments())
  await mongoose.connection.close()
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
