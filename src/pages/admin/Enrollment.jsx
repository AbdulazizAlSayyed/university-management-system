import { useState, useMemo } from 'react'
import { ClipboardList, UserPlus, UserMinus, Users, Search } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, CardHeader, Button, Avatar, Badge, Select, SearchInput,
  EmptyState, ProgressBar,
} from '../../components/ui'
import { fullName, classNames } from '../../utils/helpers'

export default function AdminEnrollment() {
  const { courses, users, enrollments, enrollStudent, dropStudent } = useData()
  const { toast } = useToast()
  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const [search, setSearch] = useState('')

  const course = courses.find((c) => c.id === courseId)
  const students = users.filter((u) => u.role === 'student')

  const enrolledIds = useMemo(
    () => new Set(enrollments.filter((e) => e.courseId === courseId).map((e) => e.studentId)),
    [enrollments, courseId]
  )
  const enrolled = students.filter((s) => enrolledIds.has(s.id))
  const available = students.filter((s) => !enrolledIds.has(s.id)).filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return fullName(s).toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q)
  })

  const capacityPct = course ? Math.round((enrolled.length / course.capacity) * 100) : 0
  const full = course && enrolled.length >= course.capacity

  const add = (s) => {
    if (full) return toast('Course is at full capacity.', 'error')
    enrollStudent(s.id, courseId, 'u-admin')
    toast(`${fullName(s)} enrolled in ${course.code}.`, 'success')
  }
  const remove = (s) => {
    dropStudent(s.id, courseId, 'u-admin')
    toast(`${fullName(s)} removed from ${course.code}.`, 'info')
  }

  return (
    <div>
      <PageHeader title="Student Enrollment" subtitle="Enroll or remove students and monitor course capacity." icon={ClipboardList} />

      {/* Course selector + capacity */}
      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:w-96">
            <label className="field-label">Select course</label>
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </Select>
          </div>
          {course && (
            <div className="sm:w-72">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Capacity</span>
                <span className={classNames('font-semibold', full ? 'text-red-600' : 'text-slate-700')}>
                  {enrolled.length} / {course.capacity}
                </span>
              </div>
              <ProgressBar value={capacityPct} tone={full ? 'red' : capacityPct > 80 ? 'amber' : 'brand'} />
              {full && <p className="mt-1 text-xs font-medium text-red-500">Course is full.</p>}
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrolled */}
        <Card>
          <CardHeader title="Enrolled Students" subtitle={`${enrolled.length} enrolled`} icon={Users} />
          {enrolled.length === 0 ? (
            <EmptyState icon={Users} title="No students enrolled" message="Add students from the panel on the right." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {enrolled.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={s} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700">{fullName(s)}</p>
                    <p className="truncate text-xs text-slate-400">{s.studentId} · {s.program}</p>
                  </div>
                  <Button size="sm" variant="ghost" icon={UserMinus} className="hover:bg-red-50 hover:text-red-600" onClick={() => remove(s)}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Available */}
        <Card>
          <CardHeader title="Add Students" subtitle={`${available.length} not enrolled`} icon={UserPlus} />
          <div className="border-b border-slate-100 p-4">
            <SearchInput placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {available.length === 0 ? (
            <EmptyState icon={Search} title="No students to add" message="Every student is already enrolled or no match found." />
          ) : (
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {available.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={s} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700">{fullName(s)}</p>
                    <p className="truncate text-xs text-slate-400">{s.studentId} · {s.program}</p>
                  </div>
                  {s.status !== 'active' && <Badge tone="amber">{s.status}</Badge>}
                  <Button size="sm" variant="soft" icon={UserPlus} onClick={() => add(s)} disabled={full}>Enroll</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
