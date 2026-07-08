import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as seed from '../data/mockData'
import { uid, scoreToLetter, scoreToPoints } from '../utils/helpers'

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

// deep clone helper so edits don't mutate the seed module
const clone = (x) => JSON.parse(JSON.stringify(x))

export function DataProvider({ children }) {
  const [users, setUsers] = useState(() => clone(seed.users))
  const [courses, setCourses] = useState(() => clone(seed.courses))
  const [enrollments, setEnrollments] = useState(() => clone(seed.enrollments))
  const [materials, setMaterials] = useState(() => clone(seed.materials))
  const [assignments, setAssignments] = useState(() => clone(seed.assignments))
  const [submissions, setSubmissions] = useState(() => clone(seed.submissions))
  const [grades, setGrades] = useState(() => clone(seed.grades))
  const [exams, setExams] = useState(() => clone(seed.exams))
  const [announcements, setAnnouncements] = useState(() => clone(seed.announcements))
  const [attendance, setAttendance] = useState(() => clone(seed.attendance))
  const [notifications, setNotifications] = useState(() => clone(seed.notifications))
  const [calendarEvents, setCalendarEvents] = useState(() => clone(seed.calendarEvents))
  const [auditLogs, setAuditLogs] = useState(() => clone(seed.auditLogs))

  const log = useCallback((actorId, action, entity, detail) => {
    setAuditLogs((prev) => [
      { id: uid('log'), actorId, action, entity, detail, timestamp: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  // ---------------- Users ----------------
  const addUser = useCallback((data, actorId = 'u-admin') => {
    const user = {
      id: uid('u'),
      status: 'pending',
      avatarColor: 'bg-brand-600',
      createdAt: new Date().toISOString().slice(0, 10),
      ...data,
    }
    setUsers((prev) => [...prev, user])
    log(actorId, 'create', 'User', `Created ${data.role} account "${data.firstName} ${data.lastName}"`)
    return user
  }, [log])

  const updateUser = useCallback((id, patch, actorId = 'u-admin') => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
    const label = `${patch.firstName || ''} ${patch.lastName || ''}`.trim() || 'a user'
    log(actorId, 'update', 'User', `Updated account "${label}"`)
  }, [log])

  const setUserStatus = useCallback((id, status, actorId = 'u-admin') => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
    const u = users.find((x) => x.id === id)
    log(actorId, 'update', 'User', `${status === 'active' ? 'Activated' : status === 'inactive' ? 'Deactivated' : 'Set pending'} account "${u ? u.firstName + ' ' + u.lastName : id}"`)
  }, [log, users])

  const deleteUser = useCallback((id, actorId = 'u-admin') => {
    const u = users.find((x) => x.id === id)
    setUsers((prev) => prev.filter((x) => x.id !== id))
    setEnrollments((prev) => prev.filter((e) => e.studentId !== id))
    log(actorId, 'delete', 'User', `Deleted account "${u ? u.firstName + ' ' + u.lastName : id}"`)
  }, [log, users])

  // ---------------- Courses ----------------
  const addCourse = useCallback((data, actorId = 'u-admin') => {
    const course = { id: uid('c'), status: 'active', semester: seed.CURRENT_SEMESTER, color: 'bg-brand-500', ...data }
    setCourses((prev) => [...prev, course])
    log(actorId, 'create', 'Course', `Created course ${data.code} — ${data.name}`)
    return course
  }, [log])

  const updateCourse = useCallback((id, patch, actorId = 'u-admin') => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    log(actorId, 'update', 'Course', `Updated course ${patch.code || id}`)
  }, [log])

  const deleteCourse = useCallback((id, actorId = 'u-admin') => {
    const c = courses.find((x) => x.id === id)
    setCourses((prev) => prev.filter((x) => x.id !== id))
    setEnrollments((prev) => prev.filter((e) => e.courseId !== id))
    log(actorId, 'delete', 'Course', `Deleted course ${c ? c.code : id}`)
  }, [log, courses])

  // ---------------- Enrollments ----------------
  // True if the student holds a final passing grade (not F) in the course.
  const hasPassed = useCallback((studentId, courseId) =>
    grades.some((g) => g.studentId === studentId && g.courseId === courseId && g.status === 'final' && g.letter && g.letter.toUpperCase() !== 'F'),
  [grades])

  // Prerequisite courses the student has NOT passed yet (returns course codes).
  const missingPrereqs = useCallback((studentId, course) =>
    (course.prerequisites || [])
      .filter((pid) => !hasPassed(studentId, pid))
      .map((pid) => courses.find((c) => c.id === pid)?.code || pid),
  [hasPassed, courses])

  // Enroll a student: blocked without prerequisites, waitlisted when full.
  // Returns { ok, status?, reason?, missing? }
  const enrollStudent = useCallback((studentId, courseId, actorId) => {
    const course = courses.find((x) => x.id === courseId)
    if (!course) return { ok: false, reason: 'not-found' }
    const existing = enrollments.find((e) => e.studentId === studentId && e.courseId === courseId)
    if (existing) return { ok: false, reason: existing.status === 'waitlisted' ? 'already-waitlisted' : 'already-enrolled' }

    const missing = missingPrereqs(studentId, course)
    if (missing.length) return { ok: false, reason: 'prerequisites', missing }

    const enrolledCount = enrollments.filter((e) => e.courseId === courseId && e.status === 'enrolled').length
    const isFull = enrolledCount >= course.capacity
    const status = isFull ? 'waitlisted' : 'enrolled'

    setEnrollments((prev) => [
      ...prev,
      { id: uid('e'), studentId, courseId, enrolledAt: new Date().toISOString().slice(0, 10), status, waitlistedAt: isFull ? new Date().toISOString() : null },
    ])
    // create an in-progress grade record only for real enrollments
    if (!isFull) setGrades((prev) => [...prev, { id: uid('g'), studentId, courseId, letter: null, points: null, score: null, status: 'in-progress' }])
    const s = users.find((x) => x.id === studentId)
    log(actorId || studentId, 'create', 'Enrollment', isFull
      ? `${s ? s.firstName + ' ' + s.lastName : studentId} joined the waitlist of ${course.code} (course full)`
      : `${s ? s.firstName + ' ' + s.lastName : studentId} enrolled in ${course.code}`)
    return { ok: true, status }
  }, [enrollments, courses, users, missingPrereqs, log])

  // Drop / leave waitlist. Freed seats auto-promote the first waitlisted student (FIFO).
  const dropStudent = useCallback((studentId, courseId, actorId) => {
    const removed = enrollments.find((e) => e.studentId === studentId && e.courseId === courseId)
    if (!removed) return
    let promoted = null
    if (removed.status === 'enrolled') {
      promoted = enrollments
        .filter((e) => e.courseId === courseId && e.status === 'waitlisted')
        .sort((a, b) => new Date(a.waitlistedAt || 0) - new Date(b.waitlistedAt || 0))[0] || null
    }
    setEnrollments((prev) => prev
      .filter((e) => !(e.studentId === studentId && e.courseId === courseId))
      .map((e) => (promoted && e.id === promoted.id
        ? { ...e, status: 'enrolled', waitlistedAt: null, enrolledAt: new Date().toISOString().slice(0, 10) }
        : e)))
    setGrades((prev) => {
      let next = prev.filter((g) => !(g.studentId === studentId && g.courseId === courseId && g.status === 'in-progress'))
      if (promoted && !next.some((g) => g.studentId === promoted.studentId && g.courseId === courseId && g.status === 'in-progress')) {
        next = [...next, { id: uid('g'), studentId: promoted.studentId, courseId, letter: null, points: null, score: null, status: 'in-progress' }]
      }
      return next
    })
    const c = courses.find((x) => x.id === courseId)
    const s = users.find((x) => x.id === studentId)
    log(actorId || studentId, 'delete', 'Enrollment', `${s ? s.firstName + ' ' + s.lastName : studentId} ${removed.status === 'waitlisted' ? 'left the waitlist of' : 'dropped'} ${c ? c.code : courseId}`)
    if (promoted) {
      setNotifications((prev) => [
        { id: uid('n'), userId: promoted.studentId, type: 'enrollment', title: `Enrolled in ${c ? c.code : 'a course'}`, body: `A seat opened up in ${c ? `${c.code} — ${c.name}` : 'a course'}. You were moved off the waitlist and are now enrolled.`, createdAt: new Date().toISOString(), read: false, link: '/student/courses' },
        ...prev,
      ])
      const p = users.find((x) => x.id === promoted.studentId)
      log('u-admin', 'update', 'Enrollment', `${p ? p.firstName + ' ' + p.lastName : promoted.studentId} promoted from the waitlist of ${c ? c.code : courseId}`)
    }
  }, [enrollments, courses, users, log])

  // ---------------- Materials ----------------
  const addMaterial = useCallback((data, actorId) => {
    const m = { id: uid('m'), uploadedAt: new Date().toISOString().slice(0, 10), ...data }
    setMaterials((prev) => [m, ...prev])
    log(actorId, 'create', 'Material', `Uploaded material "${data.title}"`)
    return m
  }, [log])

  const deleteMaterial = useCallback((id, actorId) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
    log(actorId, 'delete', 'Material', `Deleted a course material`)
  }, [log])

  // ---------------- Assignments ----------------
  const addAssignment = useCallback((data, actorId) => {
    const a = { id: uid('a'), createdAt: new Date().toISOString().slice(0, 10), maxScore: 100, attachment: null, ...data }
    setAssignments((prev) => [a, ...prev])
    log(actorId, 'create', 'Assignment', `Created assignment "${data.title}"`)
    return a
  }, [log])

  const updateAssignment = useCallback((id, patch, actorId) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    log(actorId, 'update', 'Assignment', `Updated an assignment`)
  }, [log])

  const deleteAssignment = useCallback((id, actorId) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id))
    log(actorId, 'delete', 'Assignment', `Deleted an assignment`)
  }, [log])

  // ---------------- Submissions ----------------
  const submitAssignment = useCallback((assignmentId, studentId, fileName) => {
    setSubmissions((prev) => {
      const existing = prev.find((s) => s.assignmentId === assignmentId && s.studentId === studentId)
      if (existing) {
        return prev.map((s) =>
          s.id === existing.id ? { ...s, fileName, submittedAt: new Date().toISOString().slice(0, 10), status: 'submitted', score: null, feedback: null } : s
        )
      }
      return [
        ...prev,
        { id: uid('s'), assignmentId, studentId, submittedAt: new Date().toISOString().slice(0, 10), fileName, status: 'submitted', score: null, feedback: null },
      ]
    })
    log(studentId, 'create', 'Submission', `Submitted assignment file "${fileName}"`)
  }, [log])

  const gradeSubmission = useCallback((submissionId, score, feedback, actorId) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, score: Number(score), feedback, status: 'graded' } : s))
    )
    log(actorId, 'update', 'Grade', `Graded a submission (${score})`)
  }, [log])

  // ---------------- Final grades ----------------
  const setFinalGrade = useCallback((studentId, courseId, score, actorId) => {
    const letter = scoreToLetter(Number(score))
    const points = scoreToPoints(Number(score))
    setGrades((prev) => {
      const existing = prev.find((g) => g.studentId === studentId && g.courseId === courseId)
      if (existing) {
        return prev.map((g) =>
          g.id === existing.id ? { ...g, score: Number(score), letter, points, status: 'final' } : g
        )
      }
      return [...prev, { id: uid('g'), studentId, courseId, score: Number(score), letter, points, status: 'final' }]
    })
    log(actorId, 'update', 'Grade', `Entered final grade ${letter} for a student`)
  }, [log])

  // ---------------- Exams ----------------
  const addExam = useCallback((data, actorId = 'u-admin') => {
    const x = { id: uid('x'), ...data }
    setExams((prev) => [...prev, x])
    log(actorId, 'create', 'Exam', `Scheduled exam "${data.title}"`)
    return x
  }, [log])

  const updateExam = useCallback((id, patch, actorId = 'u-admin') => {
    setExams((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    log(actorId, 'update', 'Exam', `Updated an exam`)
  }, [log])

  const deleteExam = useCallback((id, actorId = 'u-admin') => {
    setExams((prev) => prev.filter((x) => x.id !== id))
    log(actorId, 'delete', 'Exam', `Deleted an exam`)
  }, [log])

  // ---------------- Announcements ----------------
  const addAnnouncement = useCallback((data, actorId) => {
    const a = { id: uid('an'), createdAt: new Date().toISOString().slice(0, 10), pinned: false, ...data }
    setAnnouncements((prev) => [a, ...prev])
    log(actorId, 'create', 'Announcement', `Posted announcement "${data.title}"`)
    return a
  }, [log])

  const deleteAnnouncement = useCallback((id, actorId) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    log(actorId, 'delete', 'Announcement', `Deleted an announcement`)
  }, [log])

  // ---------------- Attendance ----------------
  const saveAttendance = useCallback((data, actorId) => {
    const rec = { id: uid('att'), ...data }
    setAttendance((prev) => [rec, ...prev])
    log(actorId, 'create', 'Attendance', `Recorded attendance for ${data.date}`)
    return rec
  }, [log])

  // ---------------- Notifications ----------------
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback((userId) => {
    setNotifications((prev) => prev.map((n) => (n.userId === userId ? { ...n, read: true } : n)))
  }, [])

  // ---------------- Calendar ----------------
  const addCalendarEvent = useCallback((data, actorId) => {
    const ev = { id: uid('cal'), ...data }
    setCalendarEvents((prev) => [...prev, ev].sort((a, b) => new Date(a.date) - new Date(b.date)))
    log(actorId, 'create', 'Calendar', `Added calendar event "${data.title}"`)
    return ev
  }, [log])

  const deleteCalendarEvent = useCallback((id, actorId) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id))
    log(actorId, 'delete', 'Calendar', `Removed a calendar event`)
  }, [log])

  const value = useMemo(
    () => ({
      users, courses, enrollments, materials, assignments, submissions, grades,
      exams, announcements, attendance, notifications, calendarEvents, auditLogs,
      addUser, updateUser, setUserStatus, deleteUser,
      addCourse, updateCourse, deleteCourse,
      enrollStudent, dropStudent, hasPassed, missingPrereqs,
      addMaterial, deleteMaterial,
      addAssignment, updateAssignment, deleteAssignment,
      submitAssignment, gradeSubmission,
      setFinalGrade,
      addExam, updateExam, deleteExam,
      addAnnouncement, deleteAnnouncement,
      saveAttendance,
      markNotificationRead, markAllNotificationsRead,
      addCalendarEvent, deleteCalendarEvent,
    }),
    [
      users, courses, enrollments, materials, assignments, submissions, grades,
      exams, announcements, attendance, notifications, calendarEvents, auditLogs,
      addUser, updateUser, setUserStatus, deleteUser, addCourse, updateCourse, deleteCourse,
      enrollStudent, dropStudent, hasPassed, missingPrereqs, addMaterial, deleteMaterial, addAssignment, updateAssignment,
      deleteAssignment, submitAssignment, gradeSubmission, setFinalGrade, addExam, updateExam,
      deleteExam, addAnnouncement, deleteAnnouncement, saveAttendance, markNotificationRead,
      markAllNotificationsRead, addCalendarEvent, deleteCalendarEvent,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
