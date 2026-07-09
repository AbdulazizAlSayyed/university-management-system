import { useState, useEffect, useCallback } from 'react'
import { studentApi, uploadApi } from '../api'

export default function useStudentData() {
  const [data, setData] = useState({
    courses: [], users: [], enrollments: [],
    assignments: [], grades: [], exams: [], notifications: [], announcements: [],
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    let interval

    async function load() {
      try {
        const [coursesRes, enrollmentsRes, usersRes, assignmentsRes, gradesRes, examsRes, notifsRes, dashRes] =
          await Promise.allSettled([
            studentApi.getAllCourses(),
            studentApi.getEnrollments(),
            studentApi.getUsers(),
            studentApi.getAssignments(),
            studentApi.getGrades(),
            studentApi.getExams(),
            studentApi.getNotifications(),
            studentApi.getDashboard(),
          ])

        if (cancelled) return

        const courses = coursesRes.value?.courses || []
        const enrollments = enrollmentsRes.value?.enrollments || []
        const users = usersRes.value?.users || []
        const assignments = assignmentsRes.value?.assignments || []
        const grades = gradesRes.value?.grades || []
        const exams = examsRes.value?.exams || []
        const notifications = notifsRes.value?.notifications || []
        const announcements = dashRes.value?.announcements || []

        setData({ courses, enrollments, users, assignments, grades, exams, notifications, announcements, loading: false })
      } catch (e) {
        console.error('useStudentData error', e)
        if (!cancelled) setData((d) => ({ ...d, loading: false }))
      }
    }

    async function refresh() {
      try {
        const [assignmentsRes, gradesRes, notifsRes] = await Promise.allSettled([
          studentApi.getAssignments(),
          studentApi.getGrades(),
          studentApi.getNotifications(),
        ])
        if (cancelled) return
        setData((d) => ({
          ...d,
          assignments: assignmentsRes.value?.assignments || d.assignments,
          grades: gradesRes.value?.grades || d.grades,
          notifications: notifsRes.value?.notifications || d.notifications,
        }))
      } catch { /* ignore */ }
    }

    load()
    interval = setInterval(refresh, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const enroll = useCallback(async (courseId) => {
    const result = await studentApi.enroll(courseId)
    const enrollment = result.enrollment
    setData((d) => ({ ...d, enrollments: [...d.enrollments, enrollment] }))
    return result
  }, [])

  const drop = useCallback(async (courseId) => {
    await studentApi.drop(courseId)
    setData((d) => ({ ...d, enrollments: d.enrollments.filter((e) => e.courseId !== courseId) }))
  }, [])

  const submitAssignment = useCallback(async (assignmentId, file) => {
    const uploadRes = await uploadApi.uploadFile(file)
    const result = await studentApi.submitAssignment(assignmentId, uploadRes.filename)
    const submission = result.submission
    setData((d) => ({
      ...d,
      assignments: d.assignments.map((a) =>
        (a.id || a._id) === assignmentId
          ? { ...a, sub: { ...submission, id: submission._id || submission.id, assignmentId, status: 'submitted', fileName: submission.fileUrl } }
          : a
      ),
    }))
    return result
  }, [])

  const markNotificationRead = useCallback(async (id) => {
    await studentApi.markNotificationRead(id)
    setData((d) => ({
      ...d,
      notifications: d.notifications.map((n) =>
        (n._id || n.id) === id ? { ...n, read: true } : n
      ),
    }))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await studentApi.markAllNotificationsRead()
    setData((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }))
  }, [])

  const calculateGrade = useCallback(async (courseId) => {
    return studentApi.calculateGrade(courseId)
  }, [])

  return { ...data, enroll, drop, submitAssignment, markNotificationRead, markAllNotificationsRead, calculateGrade }
}
