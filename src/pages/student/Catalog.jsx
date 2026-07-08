// Mahmoud (Team Lead) — Catalog: fetches courses + enrollments from API, enroll/drop via API
import { useState, useMemo, useCallback } from 'react'
import { Compass, Check, Plus, Minus, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { studentApi } from '../../api'
import { useFetch } from '../../hooks/useFetch'
import { PageHeader, Card, Button, Badge, SearchInput, Select, EmptyState, LoadingState } from '../../components/ui'
import CourseCard from '../../components/CourseCard'
import { fullName } from '../../utils/helpers'

export default function StudentCatalog() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { data, loading, reload } = useFetch(() => studentApi.getCatalog())

  const userById = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries(data.users.map((u) => [u.id, u]))
  }, [data])

  const myCourseIds = useMemo(() => {
    if (!data) return new Set()
    return new Set(data.enrollments.filter((e) => e.studentId === currentUser.id).map((e) => e.courseId))
  }, [data, currentUser.id])

  const countFor = useCallback((cid) => {
    if (!data) return 0
    return data.enrollments.filter((e) => e.courseId === cid).length
  }, [data])

  const list = useMemo(() => {
    if (!data) return []
    return data.courses.filter((c) => {
      if (c.status !== 'active') return false
      const enrolled = myCourseIds.has(c.id)
      if (filter === 'enrolled' && !enrolled) return false
      if (filter === 'available' && enrolled) return false
      if (search) {
        const q = search.toLowerCase()
        return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      }
      return true
    })
  }, [data, myCourseIds, filter, search])

  const toggle = async (c) => {
    if (myCourseIds.has(c.id)) {
      try { await studentApi.drop(c.id); toast(`Dropped ${c.code}.`, 'info'); reload() } catch { toast('Failed to drop.', 'error') }
    } else {
      if (countFor(c.id) >= c.capacity) return toast(`${c.code} is full.`, 'error')
      try { await studentApi.enroll(c.id); toast(`Enrolled in ${c.code}!`, 'success'); reload() } catch { toast('Failed to enroll.', 'error') }
    }
  }

  if (loading) return <LoadingState label="Loading catalog…" />

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
