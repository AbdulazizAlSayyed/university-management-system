import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, BookOpen, ClipboardList, UserCheck, ArrowRight, Plus, ScrollText,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { PageHeader, StatCard, Card, CardHeader, Button, Avatar, Badge, EmptyState } from '../../components/ui'
import { fullName, timeAgo, classNames } from '../../utils/helpers'

// Lightweight horizontal bar chart (no external chart lib)
function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.capacity), 1)
  return (
    <div className="space-y-3 p-5">
      {data.map((d) => {
        const enrolledPct = (d.students / max) * 100
        const capPct = (d.capacity / max) * 100
        return (
          <div key={d.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">{d.name}</span>
              <span className="text-slate-400">{d.students}/{d.capacity}</span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-lg bg-slate-100">
              <div className="absolute inset-y-0 left-0 rounded-lg bg-brand-100" style={{ width: `${capPct}%` }} />
              <div className="absolute inset-y-0 left-0 flex items-center rounded-lg bg-brand-600 transition-all" style={{ width: `${enrolledPct}%` }} />
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-600" /> Enrolled</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-100" /> Capacity</span>
      </div>
    </div>
  )
}

// Simple SVG donut for status breakdown
function Donut({ segments }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const radius = 60
  const circumference = 2 * Math.PI * radius
  let offset = 0
  return (
    <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:justify-center sm:gap-8">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {segments.map((s, i) => {
          const len = (s.value / total) * circumference
          const seg = (
            <circle
              key={i}
              cx="80" cy="80" r={radius} fill="none"
              stroke={s.color} strokeWidth="18"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return seg
        })}
        <text x="80" y="80" transform="rotate(90 80 80)" textAnchor="middle" dominantBaseline="central" className="fill-slate-800 text-2xl font-extrabold">{total}</text>
      </svg>
      <ul className="space-y-2">
        {segments.map((s) => (
          <li key={s.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-medium text-slate-600">{s.name}</span>
            <span className="font-bold text-slate-800">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AdminDashboard() {
  const data = useData()
  const navigate = useNavigate()
  const { users, courses, enrollments, auditLogs, setUserStatus } = data

  const students = users.filter((u) => u.role === 'student')
  const professors = users.filter((u) => u.role === 'professor')
  const pending = users.filter((u) => u.status === 'pending')

  const enrollByCourse = useMemo(
    () => courses.map((c) => ({
      name: c.code,
      students: enrollments.filter((e) => e.courseId === c.id).length,
      capacity: c.capacity,
    })),
    [courses, enrollments]
  )

  const statusSegments = useMemo(() => {
    const count = (s) => users.filter((u) => u.status === s).length
    return [
      { name: 'Active', value: count('active'), color: '#10b981' },
      { name: 'Pending', value: count('pending'), color: '#f59e0b' },
      { name: 'Inactive', value: count('inactive'), color: '#ef4444' },
    ].filter((d) => d.value > 0)
  }, [users])

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of students, professors, courses, and enrollment."
        icon={Users}
        actions={
          <>
            <Button variant="secondary" icon={BookOpen} onClick={() => navigate('/admin/courses')}>Courses</Button>
            <Button icon={Plus} onClick={() => navigate('/admin/users')}>Add user</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GraduationCap} label="Total Students" value={students.length} sub={`${students.filter((s) => s.status === 'active').length} active`} tone="brand" />
        <StatCard icon={Users} label="Professors" value={professors.length} sub={`${professors.filter((s) => s.status === 'active').length} active`} tone="emerald" />
        <StatCard icon={BookOpen} label="Courses" value={courses.length} sub={`${courses.reduce((a, c) => a + c.credits, 0)} total credits`} tone="violet" />
        <StatCard icon={ClipboardList} label="Enrollments" value={enrollments.length} sub="This semester" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Enrollment by Course" subtitle="Students enrolled vs. capacity" icon={BookOpen} />
          <BarChart data={enrollByCourse} />
        </Card>

        <Card>
          <CardHeader title="Accounts by Status" icon={UserCheck} />
          <Donut segments={statusSegments} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Pending Activations"
            subtitle={`${pending.length} account${pending.length !== 1 ? 's' : ''} awaiting approval`}
            icon={UserCheck}
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>View all <ArrowRight size={14} /></Button>}
          />
          {pending.length === 0 ? (
            <EmptyState icon={UserCheck} title="No pending accounts" message="All user accounts have been activated." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar user={u} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700">{fullName(u)}</p>
                    <p className="truncate text-xs text-slate-400">{u.email}</p>
                  </div>
                  <Badge tone="brand">{u.role}</Badge>
                  <Button size="sm" variant="success" icon={UserCheck} onClick={() => setUserStatus(u.id, 'active')}>Activate</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent Activity" subtitle="Latest actions in the system" icon={ScrollText}
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/audit')}>Audit log <ArrowRight size={14} /></Button>}
          />
          <ul className="divide-y divide-slate-100">
            {auditLogs.slice(0, 6).map((a) => {
              const actor = users.find((u) => u.id === a.actorId)
              return (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className={classNames('mt-1.5 h-2 w-2 shrink-0 rounded-full', a.action === 'create' ? 'bg-emerald-500' : a.action === 'delete' ? 'bg-red-500' : 'bg-brand-500')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{a.detail}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{actor ? fullName(actor) : 'System'} · {timeAgo(a.timestamp)}</p>
                  </div>
                  <Badge tone={a.action === 'create' ? 'emerald' : a.action === 'delete' ? 'red' : 'brand'}>{a.action}</Badge>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
