// Mahmoud (Team Lead) — My Courses: fetches enrolled courses from API
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight, Compass } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { studentApi } from '../../api'
import { useFetch } from '../../hooks/useFetch'
import { PageHeader, Card, Button, EmptyState, LoadingState } from '../../components/ui'
import CourseCard from '../../components/CourseCard'
import { fullName } from '../../utils/helpers'

export default function StudentCourses() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { data, loading } = useFetch(() => studentApi.getMyCourses())

  const userById = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries(data.users.map((u) => [u.id, u]))
  }, [data])

  if (loading) return <LoadingState label="Loading your courses…" />
  if (!data) return <Card><EmptyState icon={BookOpen} title="Could not load courses" message="Please try again later." /></Card>

  const { courses, enrollments } = data
  const myCourseIds = new Set(
    (enrollments || []).filter((e) => e.studentId === currentUser.id).map((e) => e.courseId)
  )
  const myCourses = (courses || []).filter((c) => myCourseIds.has(c.id))

  return (
    <div>
      <PageHeader
        title="My Courses"
        subtitle="Courses you're enrolled in this semester."
        icon={BookOpen}
        actions={<Button variant="secondary" icon={Compass} onClick={() => navigate('/student/catalog')}>Browse catalog</Button>}
      />

      {myCourses.length === 0 ? (
        <Card><EmptyState icon={Compass} title="Not enrolled yet" message="Browse the catalog to enroll in courses." action={<Button icon={Compass} onClick={() => navigate('/student/catalog')}>Browse catalog</Button>} /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {myCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              professorName={userById[c.professorId] ? fullName(userById[c.professorId]) : 'TBA'}
              enrolledCount={(enrollments || []).filter((e) => e.courseId === c.id).length}
              onClick={() => navigate(`/student/courses/${c.id}`)}
              footer={<Button variant="soft" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate(`/student/courses/${c.id}`) }}>Open classroom <ArrowRight size={14} /></Button>}
            />
          ))}
        </div>
      )}
    </div>
  )
}
