import { asyncHandler } from '../../utils/asyncHandler.js'
import * as svc from './admin.service.js'

// Dashboard
export const dashboard = asyncHandler(async (req, res) => res.json(await svc.getDashboardStats()))

// Users
export const listUsers = asyncHandler(async (req, res) => res.json(await svc.listUsers(req.query)))
export const createUser = asyncHandler(async (req, res) => res.status(201).json(await svc.createUser(req.body, req.user._id)))
export const getUser = asyncHandler(async (req, res) => res.json(await svc.getUser(req.params.id)))
export const updateUser = asyncHandler(async (req, res) => res.json(await svc.updateUser(req.params.id, req.body, req.user._id)))
export const deleteUser = asyncHandler(async (req, res) => res.json({ message: 'User deleted', user: await svc.deleteUser(req.params.id, req.user._id) }))
export const setUserStatus = asyncHandler(async (req, res) => res.json(await svc.setUserStatus(req.params.id, req.body.status, req.user._id)))

// Courses
export const listCourses = asyncHandler(async (req, res) => res.json(await svc.listCourses()))
export const createCourse = asyncHandler(async (req, res) => res.status(201).json(await svc.createCourse(req.body, req.user._id)))
export const updateCourse = asyncHandler(async (req, res) => res.json(await svc.updateCourse(req.params.id, req.body, req.user._id)))
export const deleteCourse = asyncHandler(async (req, res) => res.json({ message: 'Course deleted', course: await svc.deleteCourse(req.params.id, req.user._id) }))
export const getRoster = asyncHandler(async (req, res) => res.json(await svc.getRoster(req.params.id)))

// Enrollment
export const enroll = asyncHandler(async (req, res) => res.json(await svc.enrollStudent(req.body.studentId, req.body.courseId, req.user._id)))
export const drop = asyncHandler(async (req, res) => res.json(await svc.dropStudent(req.body.studentId, req.body.courseId, req.user._id)))

// Exams
export const listExams = asyncHandler(async (req, res) => res.json(await svc.listExams()))
export const createExam = asyncHandler(async (req, res) => res.status(201).json(await svc.createExam(req.body, req.user._id)))
export const updateExam = asyncHandler(async (req, res) => res.json(await svc.updateExam(req.params.id, req.body, req.user._id)))
export const deleteExam = asyncHandler(async (req, res) => res.json({ message: 'Exam deleted', exam: await svc.deleteExam(req.params.id, req.user._id) }))

// Calendar
export const listCalendar = asyncHandler(async (req, res) => res.json(await svc.listCalendar()))
export const createEvent = asyncHandler(async (req, res) => res.status(201).json(await svc.createEvent(req.body, req.user._id)))
export const deleteEvent = asyncHandler(async (req, res) => res.json({ message: 'Event deleted', event: await svc.deleteEvent(req.params.id, req.user._id) }))

// Announcements
export const listAnnouncements = asyncHandler(async (req, res) => res.json(await svc.listAnnouncements()))
export const createAnnouncement = asyncHandler(async (req, res) => res.status(201).json(await svc.createAnnouncement(req.body, req.user._id)))
export const deleteAnnouncement = asyncHandler(async (req, res) => res.json({ message: 'Announcement deleted', announcement: await svc.deleteAnnouncement(req.params.id, req.user._id) }))

// Audit
export const listAudit = asyncHandler(async (req, res) => res.json(await svc.listAudit(req.query)))
