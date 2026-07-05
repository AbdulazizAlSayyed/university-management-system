import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, Card, Button, EmptyState } from '../../components/ui'
import CourseCard from '../../components/CourseCard'

export default function ProfessorCourses() {
  const { courses = [], enrollments = [] } = useData()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Safely filter courses using useMemo for stability
  const myCourses = useMemo(() => {
    return courses.filter((c) => c?.professorId === currentUser?.id)
  }, [courses, currentUser])

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Courses assigned to you this semester." icon={BookOpen} />

      {myCourses.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No courses assigned" message="An administrator will assign courses to you." /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {myCourses.map((c) => (
            <CourseCard
              key={c?.id}
              course={c}
              enrolledCount={enrollments.filter((e) => e?.courseId === c?.id).length}
              onClick={() => navigate(`/professor/courses/${c?.id}`)}
              footer={
                <Button 
                  variant="soft" 
                  size="sm" 
                  className="w-full" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigate(`/professor/courses/${c?.id}`) 
                  }}
                >
                  Open classroom <ArrowRight size={14} />
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}