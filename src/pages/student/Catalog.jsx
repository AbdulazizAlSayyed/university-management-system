import { useState, useMemo } from 'react'
import { Compass, Check, Plus, Minus, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useStudentData from '../../hooks/useStudentData'
import { PageHeader, Card, Button, Badge, SearchInput, EmptyState, LoadingState } from '../../components/ui'
import CourseCard from '../../components/CourseCard'
import { fullName } from '../../utils/helpers'

export default function StudentCatalog() {
  const { loading, courses, users, enrollments, enroll, drop } = useStudentData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState('')

  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])
  const myCourseIds = useMemo(
    () => new Set(enrollments.filter((e) => e.studentId === currentUser.id && e.status === 'enrolled').map((e) => e.courseId)),
    [enrollments, currentUser.id]
  )
  const countFor = (cid) => enrollments.filter((e) => e.courseId === cid && e.status === 'enrolled').length

  const list = search
    ? courses.filter((c) => {
        const q = search.toLowerCase()
        return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      })
    : courses

  const toggle = async (c) => {
    if (myCourseIds.has(c.id)) {
      try { await drop(c.id); toast(`Dropped ${c.code}.`, 'info') } catch (err) { console.error('drop error', err); toast(err?.response?.data?.message || 'Failed to drop', 'error') }
    } else {
      if (countFor(c.id) >= c.capacity) return toast(`${c.code} is full.`, 'error')
      try { await enroll(c.id); toast(`Enrolled in ${c.code}!`, 'success') } catch (err) { console.error('enroll error', err); toast(err?.response?.data?.message || 'Failed to enroll', 'error') }
    }
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <PageHeader title="Course Catalog" subtitle="Browse available courses." icon={Compass} />

      <Card className="mb-5 p-4">
        <SearchInput className="w-full" placeholder="Search courses by code or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      {list.length === 0 ? (
        <Card><EmptyState icon={Search} title="No courses found" message={search ? 'Try a different search term.' : 'No courses available.'} /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const enrolled = myCourseIds.has(c.id)
            const full = countFor(c.id) >= c.capacity
            return (
              <CourseCard
                key={c.id}
                course={c}
                professorName={userById[c.professorId] ? fullName(userById[c.professorId]) : 'TBA'}
                enrolledCount={countFor(c.id)}
                right={enrolled ? <Badge tone="emerald"><Check size={11} /> Enrolled</Badge> : full ? <Badge tone="red">Full</Badge> : null}
                footer={
                  <Button
                    variant={enrolled ? 'secondary' : 'primary'}
                    size="sm"
                    className="w-full"
                    icon={enrolled ? Minus : Plus}
                    disabled={!enrolled && full}
                    onClick={() => toggle(c)}
                  >
                    {enrolled ? 'Drop course' : full ? 'Course full' : 'Enroll'}
                  </Button>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
