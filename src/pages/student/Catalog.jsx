import { useState, useMemo } from 'react'
<<<<<<< HEAD
import { Compass, Check, Plus, Minus, Search } from 'lucide-react'
=======
import { Compass, Check, Plus, Minus, Search, Lock, Hourglass } from 'lucide-react'
import { useData } from '../../context/DataContext'
>>>>>>> Development
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useStudentData from '../../hooks/useStudentData'
import { PageHeader, Card, Button, Badge, SearchInput, EmptyState, LoadingState } from '../../components/ui'
import CourseCard from '../../components/CourseCard'
import { fullName } from '../../utils/helpers'

export default function StudentCatalog() {
<<<<<<< HEAD
  const { loading, courses, users, enrollments, enroll, drop } = useStudentData()
=======
  const { courses, users, enrollments, enrollStudent, dropStudent, missingPrereqs } = useData()
>>>>>>> Development
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState('')

  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])
<<<<<<< HEAD
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
=======
  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])
  // My enrollment (enrolled OR waitlisted) per course
  const myEnrollmentFor = useMemo(() => {
    const map = {}
    enrollments.forEach((e) => { if (e.studentId === currentUser.id) map[e.courseId] = e })
    return map
  }, [enrollments, currentUser.id])
  const countFor = (cid) => enrollments.filter((e) => e.courseId === cid && e.status === 'enrolled').length
  const waitlistFor = (cid) =>
    enrollments
      .filter((e) => e.courseId === cid && e.status === 'waitlisted')
      .sort((a, b) => new Date(a.waitlistedAt || 0) - new Date(b.waitlistedAt || 0))
  const myWaitlistPosition = (cid) => waitlistFor(cid).findIndex((e) => e.studentId === currentUser.id) + 1

  const list = courses.filter((c) => {
    if (c.status !== 'active') return false
    const mine = !!myEnrollmentFor[c.id]
    if (filter === 'enrolled' && !mine) return false
    if (filter === 'available' && mine) return false
    if (search) {
      const q = search.toLowerCase()
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    }
    return true
  })

  const toggle = (c) => {
    const mine = myEnrollmentFor[c.id]
    if (mine) {
      dropStudent(currentUser.id, c.id)
      toast(mine.status === 'waitlisted' ? `Left the waitlist of ${c.code}.` : `Dropped ${c.code}.`, 'info')
      return
>>>>>>> Development
    }
    const res = enrollStudent(currentUser.id, c.id)
    if (!res.ok) {
      if (res.reason === 'prerequisites') toast(`You must pass ${res.missing.join(', ')} before enrolling in ${c.code}.`, 'error')
      else toast(`Could not enroll in ${c.code}.`, 'error')
      return
    }
    if (res.status === 'waitlisted') toast(`${c.code} is full — you were added to the waitlist. You'll be enrolled automatically when a seat opens.`, 'info')
    else toast(`Enrolled in ${c.code}!`, 'success')
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
            const mine = myEnrollmentFor[c.id]
            const enrolled = mine?.status === 'enrolled'
            const waitlisted = mine?.status === 'waitlisted'
            const full = countFor(c.id) >= c.capacity
            const missing = mine ? [] : missingPrereqs(currentUser.id, c)
            const locked = missing.length > 0
            const prereqCodes = (c.prerequisites || []).map((pid) => courseById[pid]?.code || pid)

            const badge = enrolled ? <Badge tone="emerald"><Check size={11} /> Enrolled</Badge>
              : waitlisted ? <Badge tone="amber"><Hourglass size={11} /> Waitlist #{myWaitlistPosition(c.id)}</Badge>
              : locked ? <Badge tone="slate"><Lock size={11} /> Locked</Badge>
              : full ? <Badge tone="red">Full</Badge>
              : null

            const btnLabel = enrolled ? 'Drop course'
              : waitlisted ? 'Leave waitlist'
              : locked ? `Requires ${missing.join(', ')}`
              : full ? 'Join waitlist'
              : 'Enroll'
            const btnIcon = enrolled || waitlisted ? Minus : locked ? Lock : full ? Hourglass : Plus

            return (
              <CourseCard
                key={c.id}
                course={c}
                professorName={userById[c.professorId] ? fullName(userById[c.professorId]) : 'TBA'}
                enrolledCount={countFor(c.id)}
                right={badge}
                footer={
                  <div className="space-y-2">
                    {prereqCodes.length > 0 && (
                      <p className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
                        <Lock size={11} /> Prerequisite{prereqCodes.length > 1 ? 's' : ''}: {prereqCodes.join(', ')}
                      </p>
                    )}
                    <Button
                      variant={mine ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full"
                      icon={btnIcon}
                      disabled={locked}
                      onClick={() => toggle(c)}
                    >
                      {btnLabel}
                    </Button>
                  </div>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
