import { useState, useMemo } from 'react'
import { CalendarCheck, Plus, Save, Check, X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, CardHeader, Button, Avatar, Badge, Select, Modal, FormField,
  Input, EmptyState,
} from '../../components/ui'
import { fullName, formatDate, classNames } from '../../utils/helpers'

export default function ProfessorAttendance() {
  const { courses, users, enrollments, attendance, saveAttendance } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const myCourses = courses.filter((c) => c.professorId === currentUser.id)
  const [courseId, setCourseId] = useState(myCourses[0]?.id || '')
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [topic, setTopic] = useState('')
  const [present, setPresent] = useState({})

  const roster = useMemo(() => {
    const ids = new Set(enrollments.filter((e) => e.courseId === courseId).map((e) => e.studentId))
    return users.filter((u) => ids.has(u.id))
  }, [enrollments, users, courseId])

  const records = attendance.filter((a) => a.courseId === courseId).sort((a, b) => new Date(b.date) - new Date(a.date))

  const startSession = () => {
    setDate(new Date().toISOString().slice(0, 10))
    setTopic('')
    setPresent(Object.fromEntries(roster.map((s) => [s.id, true])))
    setOpen(true)
  }

  const save = (e) => {
    e.preventDefault()
    if (!date) return toast('Pick a date.', 'error')
    saveAttendance({ courseId, date, topic: topic || 'Lecture', records: roster.map((s) => ({ studentId: s.id, present: !!present[s.id] })) }, currentUser.id)
    toast('Attendance recorded.', 'success')
    setOpen(false)
  }

  const rate = (rec) => Math.round((rec.records.filter((r) => r.present).length / rec.records.length) * 100)

  // Per-student attendance summary
  const summary = useMemo(() => {
    return roster.map((s) => {
      let present = 0, total = 0
      records.forEach((rec) => {
        const r = rec.records.find((x) => x.studentId === s.id)
        if (r) { total++; if (r.present) present++ }
      })
      return { student: s, present, total, pct: total ? Math.round((present / total) * 100) : null }
    })
  }, [roster, records])

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark attendance per session and track student attendance rates."
        icon={CalendarCheck}
        actions={roster.length > 0 && <Button icon={Plus} onClick={startSession}>Take attendance</Button>}
      />

      <Card className="mb-5 p-4">
        <label className="field-label">Course</label>
        <Select className="sm:w-96" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {myCourses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </Select>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions */}
        <Card>
          <CardHeader title="Sessions" subtitle={`${records.length} recorded`} icon={CalendarCheck} />
          {records.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No sessions" message="Take attendance to start tracking." action={roster.length > 0 && <Button size="sm" icon={Plus} onClick={startSession}>Take attendance</Button>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {records.map((rec) => (
                <li key={rec.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{rec.topic}</p>
                    <p className="text-xs text-slate-400">{formatDate(rec.date, { weekday: 'short', month: 'short', day: 'numeric' })} · {rec.records.length} students</p>
                  </div>
                  <Badge tone={rate(rec) >= 80 ? 'emerald' : rate(rec) >= 60 ? 'amber' : 'red'}>{rate(rec)}%</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Per-student rates */}
        <Card>
          <CardHeader title="Student Attendance" subtitle="Overall rate this semester" icon={Check} />
          {summary.length === 0 ? (
            <EmptyState icon={Check} title="No students" message="Enroll students to track attendance." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.map(({ student, present, total, pct }) => (
                <li key={student.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar user={student} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700">{fullName(student)}</p>
                    <p className="text-xs text-slate-400">{total ? `${present}/${total} sessions` : 'No records'}</p>
                  </div>
                  {pct != null ? (
                    <Badge tone={pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'red'}>{pct}%</Badge>
                  ) : <span className="text-xs text-slate-300">—</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Take Attendance" size="lg"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button icon={Save} onClick={save}>Save</Button></>}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></FormField>
            <FormField label="Topic"><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Lecture topic" /></FormField>
          </div>
          <div className="rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <span className="text-sm font-semibold text-slate-600">{roster.length} students</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPresent(Object.fromEntries(roster.map((s) => [s.id, true])))} className="text-xs font-semibold text-emerald-600">All present</button>
                <button type="button" onClick={() => setPresent(Object.fromEntries(roster.map((s) => [s.id, false])))} className="text-xs font-semibold text-red-600">All absent</button>
              </div>
            </div>
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {roster.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar user={s} size="xs" />
                  <span className="flex-1 text-sm font-medium text-slate-700">{fullName(s)}</span>
                  <button type="button" onClick={() => setPresent((p) => ({ ...p, [s.id]: !p[s.id] }))}
                    className={classNames('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition', present[s.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600')}>
                    {present[s.id] ? <><Check size={13} /> Present</> : <><X size={13} /> Absent</>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </form>
      </Modal>
    </div>
  )
}
