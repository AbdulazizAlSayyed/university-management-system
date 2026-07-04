import User from '../../models/User.js'
import Course from '../../models/Course.js'
import Enrollment from '../../models/Enrollment.js'
import Exam from '../../models/Exam.js'
import Announcement from '../../models/Announcement.js'
import CalendarEvent from '../../models/CalendarEvent.js'
import AuditLog from '../../models/AuditLog.js'
import ApiError from '../../utils/ApiError.js'
import { logAudit } from '../../utils/audit.js'

const name = (u) => (u ? `${u.firstName} ${u.lastName}` : 'unknown')

// ------------------------------ Dashboard ------------------------------
export async function getDashboardStats() {
  const [students, professors, courseCount, enrollments, pending] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'professor' }),
    Course.countDocuments(),
    Enrollment.countDocuments({ status: 'enrolled' }),
    User.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10),
  ])

  const statusAgg = await User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  const statusBreakdown = { active: 0, pending: 0, inactive: 0 }
  statusAgg.forEach((s) => { if (s._id) statusBreakdown[s._id] = s.count })

  const courses = await Course.find().select('code capacity')
  const counts = await Enrollment.aggregate([
    { $match: { status: 'enrolled' } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
  ])
  const countMap = {}
  counts.forEach((c) => { countMap[String(c._id)] = c.count })
  const enrollmentByCourse = courses.map((c) => ({
    code: c.code,
    students: countMap[String(c._id)] || 0,
    capacity: c.capacity,
  }))

  const creditsAgg = await Course.aggregate([{ $group: { _id: null, total: { $sum: '$credits' } } }])
  const totalCredits = creditsAgg[0]?.total || 0

  const recentActivity = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('actorId', 'firstName lastName')

  return {
    counts: { students, professors, courses: courseCount, enrollments, totalCredits },
    statusBreakdown,
    pending,
    enrollmentByCourse,
    recentActivity,
  }
}

// ------------------------------ Users ------------------------------
export async function listUsers({ role, status, search } = {}) {
  const q = {}
  if (role && role !== 'all') q.role = role
  if (status && status !== 'all') q.status = status
  if (search) {
    q.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { studentId: new RegExp(search, 'i') },
    ]
  }
  return User.find(q).sort({ createdAt: -1 })
}

export async function createUser(data, actorId) {
  const exists = await User.findOne({ email: String(data.email || '').toLowerCase() })
  if (exists) throw new ApiError(409, 'Email is already registered.')
  const user = await User.create({ status: 'pending', ...data })
  await logAudit(actorId, 'create', 'User', `Created ${user.role} account "${name(user)}"`)
  return user
}

export async function getUser(id) {
  const user = await User.findById(id)
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function updateUser(id, data, actorId) {
  const patch = { ...data }
  delete patch.password
  const user = await User.findByIdAndUpdate(id, patch, { new: true, runValidators: true })
  if (!user) throw new ApiError(404, 'User not found')
  await logAudit(actorId, 'update', 'User', `Updated account "${name(user)}"`)
  return user
}

export async function deleteUser(id, actorId) {
  const user = await User.findByIdAndDelete(id)
  if (!user) throw new ApiError(404, 'User not found')
  await Enrollment.deleteMany({ studentId: id })
  await logAudit(actorId, 'delete', 'User', `Deleted account "${name(user)}"`)
  return user
}

export async function setUserStatus(id, status, actorId) {
  if (!['active', 'pending', 'inactive'].includes(status)) throw new ApiError(422, 'Invalid status')
  const user = await User.findByIdAndUpdate(id, { status }, { new: true })
  if (!user) throw new ApiError(404, 'User not found')
  const label = status === 'active' ? 'Activated' : status === 'inactive' ? 'Deactivated' : 'Set pending'
  await logAudit(actorId, 'update', 'User', `${label} account "${name(user)}"`)
  return user
}

// ------------------------------ Courses ------------------------------
export async function listCourses() {
  const courses = await Course.find().sort({ code: 1 }).populate('professorId', 'firstName lastName department')
  const counts = await Enrollment.aggregate([
    { $match: { status: 'enrolled' } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
  ])
  const map = {}
  counts.forEach((c) => { map[String(c._id)] = c.count })
  return courses.map((c) => ({ ...c.toJSON(), enrolledCount: map[String(c._id)] || 0 }))
}

export async function createCourse(data, actorId) {
  if (data.code) {
    const exists = await Course.findOne({ code: String(data.code).toUpperCase() })
    if (exists) throw new ApiError(409, 'Course code already exists.')
  }
  const course = await Course.create(data)
  await logAudit(actorId, 'create', 'Course', `Created course ${course.code} - ${course.name}`)
  return course.populate({ path: 'professorId', select: 'firstName lastName department' })
}

export async function updateCourse(id, data, actorId) {
  const course = await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('professorId', 'firstName lastName department')
  if (!course) throw new ApiError(404, 'Course not found')
  await logAudit(actorId, 'update', 'Course', `Updated course ${course.code}`)
  return course
}

export async function deleteCourse(id, actorId) {
  const course = await Course.findByIdAndDelete(id)
  if (!course) throw new ApiError(404, 'Course not found')
  await Enrollment.deleteMany({ courseId: id })
  await Exam.deleteMany({ courseId: id })
  await logAudit(actorId, 'delete', 'Course', `Deleted course ${course.code}`)
  return course
}

// ------------------------------ Enrollment ------------------------------
export async function getRoster(courseId) {
  const rows = await Enrollment.find({ courseId, status: 'enrolled' })
    .populate('studentId', 'firstName lastName email studentId program status avatarColor')
  return rows.map((r) => r.studentId).filter(Boolean)
}

export async function enrollStudent(studentId, courseId, actorId) {
  const course = await Course.findById(courseId)
  if (!course) throw new ApiError(404, 'Course not found')
  const enrolled = await Enrollment.countDocuments({ courseId, status: 'enrolled' })
  if (enrolled >= course.capacity) throw new ApiError(400, 'Course is at full capacity.')
  const existing = await Enrollment.findOne({ studentId, courseId })
  if (existing) {
    if (existing.status === 'enrolled') throw new ApiError(409, 'Student is already enrolled.')
    existing.status = 'enrolled'
    await existing.save()
  } else {
    await Enrollment.create({ studentId, courseId, status: 'enrolled' })
  }
  await logAudit(actorId, 'create', 'Enrollment', `Enrolled a student in ${course.code}`)
  return getRoster(courseId)
}

export async function dropStudent(studentId, courseId, actorId) {
  await Enrollment.deleteOne({ studentId, courseId })
  const course = await Course.findById(courseId)
  await logAudit(actorId, 'delete', 'Enrollment', `Removed a student from ${course ? course.code : 'a course'}`)
  return getRoster(courseId)
}

// ------------------------------ Exams ------------------------------
export async function listExams() {
  return Exam.find().sort({ date: 1 }).populate('courseId', 'code name')
}
export async function createExam(data, actorId) {
  const exam = await Exam.create(data)
  await logAudit(actorId, 'create', 'Exam', `Scheduled exam "${exam.title}"`)
  return exam.populate({ path: 'courseId', select: 'code name' })
}
export async function updateExam(id, data, actorId) {
  const exam = await Exam.findByIdAndUpdate(id, data, { new: true }).populate('courseId', 'code name')
  if (!exam) throw new ApiError(404, 'Exam not found')
  await logAudit(actorId, 'update', 'Exam', `Updated exam "${exam.title}"`)
  return exam
}
export async function deleteExam(id, actorId) {
  const exam = await Exam.findByIdAndDelete(id)
  if (!exam) throw new ApiError(404, 'Exam not found')
  await logAudit(actorId, 'delete', 'Exam', 'Deleted an exam')
  return exam
}

// ------------------------------ Calendar ------------------------------
export async function listCalendar() {
  return CalendarEvent.find().sort({ date: 1 })
}
export async function createEvent(data, actorId) {
  const ev = await CalendarEvent.create(data)
  await logAudit(actorId, 'create', 'Calendar', `Added calendar event "${ev.title}"`)
  return ev
}
export async function deleteEvent(id, actorId) {
  const ev = await CalendarEvent.findByIdAndDelete(id)
  if (!ev) throw new ApiError(404, 'Event not found')
  await logAudit(actorId, 'delete', 'Calendar', 'Removed a calendar event')
  return ev
}

// ------------------------------ Announcements (system) ------------------------------
export async function listAnnouncements() {
  return Announcement.find({ scope: 'system' }).sort({ pinned: -1, createdAt: -1 }).populate('authorId', 'firstName lastName')
}
export async function createAnnouncement(data, actorId) {
  const ann = await Announcement.create({ ...data, scope: 'system', authorId: actorId })
  await logAudit(actorId, 'create', 'Announcement', `Posted announcement "${ann.title}"`)
  return ann.populate({ path: 'authorId', select: 'firstName lastName' })
}
export async function deleteAnnouncement(id, actorId) {
  const ann = await Announcement.findByIdAndDelete(id)
  if (!ann) throw new ApiError(404, 'Announcement not found')
  await logAudit(actorId, 'delete', 'Announcement', 'Deleted an announcement')
  return ann
}

// ------------------------------ Audit ------------------------------
export async function listAudit({ action, search } = {}) {
  const q = {}
  if (action && action !== 'all') q.action = action
  if (search) q.detail = new RegExp(search, 'i')
  return AuditLog.find(q).sort({ createdAt: -1 }).limit(200).populate('actorId', 'firstName lastName')
}
