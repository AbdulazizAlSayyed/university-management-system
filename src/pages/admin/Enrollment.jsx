import { useState, useEffect, useCallback, useMemo } from 'react'
import { ClipboardList, UserPlus, UserMinus, Users, Search, AlertTriangle } from 'lucide-react'
import * as adminApi from '../../api/admin'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, CardHeader, Button, Avatar, Badge, Select, SearchInput,
  EmptyState, ProgressBar, LoadingState,
} from '../../components/ui'
import { fullName, classNames } from '../../utils/helpers'

export default function AdminEnrollment() {
  const { toast } = useToast()
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [courseId, setCourseId] = useState('')
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rosterLoading, setRosterLoading] = useState(false)
  const [search, setSearch] = useState('')

  const loadBase = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [c, s] = await Promise.all([adminApi.listCourses(), adminApi.listUsers({ role: 'student' })])
      setCourses(c); setStudents(s)
      if (c.length && !courseId) setCourseId(c[0].id)
    } catch (e) { setError(adminApi.errMsg(e)) }
    finally { setLoading(false) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadBase() }, [loadBase])

  const loadRoster = useCallback(async (id) => {
    if (!id) return
    setRosterLoading(true)
    try { setRoster(await adminApi.getRoster(id)) }
    catch (e) { toast(adminApi.errMsg(e), 'error') }
    finally { setRosterLoading(false) }
  }, [toast])
  useEffect(() => { if (courseId) loadRoster(courseId) }, [courseId, loadRoster])

  const course = courses.find((c) => c.id === courseId)
  const enrolledIds = useMemo(() => new Set(roster.map((s) => s.id)), [roster])
  const available = students.filter((s) => !enrolledIds.has(s.id)).filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return fullName(s).toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q)
  })

  const capacityPct = course ? Math.round((roster.length / course.capacity) * 100) : 0
  const full = course && roster.length >= course.capacity

  const add = async (s) => {
    try { await adminApi.enrollStudent(s.id, courseId); toast(`${fullName(s)} enrolled.`, 'success'); loadRoster(courseId); loadBase() }
    catch (e) { toast(adminApi.errMsg(e), 'error') }
  }
  const remove = async (s) => {
    try { await adminApi.dropStudent(s.id, courseId); toast(`${fullName(s)} removed.`, 'info'); loadRoster(courseId); loadBase() }
    catch (e) { toast(adminApi.errMsg(e), 'error') }
  }

  if (loading) return <LoadingState label="Loading enrollment..." />
  if (error) return <Card><EmptyState icon={AlertTriangle} title="Could not load data" message={error} action={<Button onClick={loadBase}>Retry</Button>} /></Card>

  return (
    <div>
      <PageHeader title="Student Enrollment" subtitle="Enroll or remove students and monitor capacity." icon={ClipboardList} />

      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:w-96">
            <label className="field-label">Select course</label>
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </Select>
          </div>
          {course && (
            <div className="sm:w-72">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Capacity</span>
                <span className={classNames('font-semibold', full ? 'text-red-600' : 'text-slate-700')}>{roster.length} / {course.capacity}</span>
              </div>
              <ProgressBar value={capacityPct} tone={full ? 'red' : capacityPct > 80 ? 'amber' : 'brand'} />
              {full && <p className="mt-1 text-xs font-medium text-red-500">Course is full.</p>}
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Enrolled Students" subtitle={`${roster.length} enrolled`} icon={Users} />
          {rosterLoading ? <LoadingState label="Loading roster..." /> : roster.length === 0 ? (
            <EmptyState icon={Users} title="No students enrolled" message="Add students from the panel on the right." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {roster.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={s} size="sm" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-700">{fullName(s)}</p><p className="truncate text-xs text-slate-400">{s.studentId} - {s.program}</p></div>
                  <Button size="sm" variant="ghost" icon={UserMinus} className="hover:bg-red-50 hover:text-red-600" onClick={() => remove(s)}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Add Students" subtitle={`${available.length} not enrolled`} icon={UserPlus} />
          <div className="border-b border-slate-100 p-4"><SearchInput placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {available.length === 0 ? (
            <EmptyState icon={Search} title="No students to add" message="Everyone is enrolled or no match found." />
          ) : (
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {available.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={s} size="sm" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-700">{fullName(s)}</p><p className="truncate text-xs text-slate-400">{s.studentId} - {s.program}</p></div>
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
