import { useState, useMemo } from 'react'
import { Compass, Check, Plus, Minus, Search, Lock, Hourglass } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Card, Button, Badge, SearchInput, Select, EmptyState } from '../../components/ui'
import CourseCard from '../../components/CourseCard'
import { fullName } from '../../utils/helpers'

export default function StudentCatalog() {
  const { courses, users, enrollments, enrollStudent, dropStudent, missingPrereqs } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | enrolled | available

  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])
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

  return (
    <div>
      <PageHeader title="Course Catalog" subtitle="Browse available courses and manage your enrollment." icon={Compass} />

      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput className="flex-1" placeholder="Search courses by code or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select className="sm:w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All courses</option>
            <option value="available">Available to join</option>
            <option value="enrolled">My enrollments</option>
          </Select>
        </div>
      </Card>

      {list.length === 0 ? (
        <Card><EmptyState icon={Search} title="No courses found" message="Try a different search or filter." /></Card>
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
