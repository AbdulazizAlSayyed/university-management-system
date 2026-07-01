import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, Users, Megaphone, ClipboardList, CalendarCheck, GraduationCap,
  Plus, Trash2, Download, Link as LinkIcon, Clock, Save, Check, X, Pin,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  Card, CardHeader, Button, IconButton, Badge, StatusBadge, Avatar, Tabs, Modal,
  ConfirmDialog, FormField, Input, Textarea, Select, EmptyState, FileDropzone,
} from '../../components/ui'
import {
  fullName, formatDate, timeAgo, fileTypeMeta, scoreToLetter, gradeColor, classNames,
} from '../../utils/helpers'

export default function ProfessorClassroom() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const data = useData()
  const { currentUser } = useAuth()
  const course = data.courses.find((c) => c.id === courseId)
  const [tab, setTab] = useState('materials')

  const roster = useMemo(() => {
    const ids = new Set(data.enrollments.filter((e) => e.courseId === courseId).map((e) => e.studentId))
    return data.users.filter((u) => ids.has(u.id))
  }, [data.enrollments, data.users, courseId])

  const courseAssignments = data.assignments.filter((a) => a.courseId === courseId)

  if (!course) {
    return (
      <Card><EmptyState icon={FileText} title="Course not found" message="This course may have been removed." action={<Button onClick={() => navigate('/professor/courses')}>Back to courses</Button>} /></Card>
    )
  }

  const tabs = [
    { value: 'materials', label: 'Materials', icon: FileText },
    { value: 'roster', label: 'Roster', icon: Users, count: roster.length },
    { value: 'announcements', label: 'Announcements', icon: Megaphone },
    { value: 'assignments', label: 'Assignments', icon: ClipboardList, count: courseAssignments.length },
    { value: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { value: 'grades', label: 'Grades', icon: GraduationCap },
  ]

  return (
    <div>
      <button onClick={() => navigate('/professor/courses')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to My Courses
      </button>

      {/* Course banner */}
      <Card className="mb-6 overflow-hidden">
        <div className={classNames('h-2 w-full', course.color)} />
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="brand">{course.code}</Badge>
              <span className="text-xs text-slate-400">{course.credits} credits · {course.room}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{course.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{course.schedule} · {roster.length} students enrolled</p>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'materials' && <MaterialsTab course={course} />}
        {tab === 'roster' && <RosterTab roster={roster} />}
        {tab === 'announcements' && <AnnouncementsTab course={course} author={currentUser} />}
        {tab === 'assignments' && <AssignmentsTab course={course} />}
        {tab === 'attendance' && <AttendanceTab course={course} roster={roster} />}
        {tab === 'grades' && <GradesTab course={course} roster={roster} />}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- Materials */
function MaterialsTab({ course }) {
  const { materials, addMaterial, deleteMaterial } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [del, setDel] = useState(null)
  const [form, setForm] = useState({ week: 'Week 1', title: '', type: 'pdf', fileName: '', link: '' })

  const items = materials.filter((m) => m.courseId === course.id)
  const byWeek = useMemo(() => {
    const g = {}
    items.forEach((m) => { (g[m.week] = g[m.week] || []).push(m) })
    return g
  }, [items])

  const submit = (e) => {
    e.preventDefault()
    if (!form.title) return toast('Enter a title.', 'error')
    if (form.type === 'link' && !form.link) return toast('Enter a link URL.', 'error')
    if (form.type !== 'link' && !form.fileName) return toast('Attach a file.', 'error')
    addMaterial({
      courseId: course.id, week: form.week, title: form.title, type: form.type,
      fileName: form.type === 'link' ? null : form.fileName,
      link: form.type === 'link' ? form.link : null,
      size: form.type === 'link' ? null : '2.0 MB',
    }, currentUser.id)
    toast('Material uploaded.', 'success')
    setForm({ week: 'Week 1', title: '', type: 'pdf', fileName: '', link: '' })
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button icon={Plus} onClick={() => setOpen(true)}>Upload material</Button>
      </div>
      {items.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No materials yet" message="Upload lecture slides, PDFs, or links for your students." action={<Button icon={Plus} onClick={() => setOpen(true)}>Upload material</Button>} /></Card>
      ) : (
        <div className="space-y-5">
          {Object.entries(byWeek).map(([week, list]) => (
            <Card key={week}>
              <CardHeader title={week} subtitle={`${list.length} item${list.length !== 1 ? 's' : ''}`} icon={FileText} />
              <ul className="divide-y divide-slate-100">
                {list.map((m) => {
                  const meta = fileTypeMeta(m.type)
                  return (
                    <li key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className={classNames('rounded-lg px-2 py-1 text-[10px] font-bold', meta.color)}>{meta.label}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-700">{m.title}</p>
                        <p className="truncate text-xs text-slate-400">{m.fileName || m.link} {m.size ? `· ${m.size}` : ''} · {formatDate(m.uploadedAt)}</p>
                      </div>
                      <IconButton icon={m.type === 'link' ? LinkIcon : Download} title="Download" onClick={() => toast('Download started (demo).', 'info')} />
                      <IconButton icon={Trash2} title="Delete" onClick={() => setDel(m)} className="hover:text-red-600" />
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Upload Material"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Upload</Button></>}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Week / Topic">
              <Select value={form.week} onChange={(e) => setForm((f) => ({ ...f, week: e.target.value }))}>
                {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'].map((w) => <option key={w}>{w}</option>)}
              </Select>
            </FormField>
            <FormField label="Type">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="pdf">PDF</option>
                <option value="pptx">Slides (PPTX)</option>
                <option value="docx">Document (DOCX)</option>
                <option value="mp4">Video (MP4)</option>
                <option value="link">Web Link</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Lecture 3 — React Hooks" /></FormField>
          {form.type === 'link' ? (
            <FormField label="URL"><Input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://…" /></FormField>
          ) : (
            <FileDropzone fileName={form.fileName} onFile={(name) => setForm((f) => ({ ...f, fileName: name }))} />
          )}
        </form>
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { deleteMaterial(del.id, currentUser.id); toast('Material deleted.', 'info') }}
        title="Delete material?" message={del ? `Remove "${del.title}"?` : ''} confirmLabel="Delete" />
    </div>
  )
}

/* ----------------------------------------------------------------- Roster */
function RosterTab({ roster }) {
  if (roster.length === 0) return <Card><EmptyState icon={Users} title="No students enrolled" message="Students enrolled in this course will appear here." /></Card>
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Enrolled Students" subtitle={`${roster.length} students`} icon={Users} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Student</th><th className="px-5 py-3">Student ID</th>
              <th className="px-5 py-3">Program</th><th className="px-5 py-3">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar user={s} size="sm" /><span className="font-semibold text-slate-700">{fullName(s)}</span></div></td>
                <td className="px-5 py-3 text-slate-600">{s.studentId}</td>
                <td className="px-5 py-3 text-slate-600">{s.program}</td>
                <td className="px-5 py-3 text-slate-500">{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ----------------------------------------------------------------- Announcements */
function AnnouncementsTab({ course, author }) {
  const { announcements, addAnnouncement, deleteAnnouncement } = useData()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })

  const items = announcements.filter((a) => a.scope === 'course' && a.courseId === course.id)
    .sort((a, b) => (b.pinned - a.pinned) || new Date(b.createdAt) - new Date(a.createdAt))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title || !form.body) return toast('Enter a title and message.', 'error')
    addAnnouncement({ scope: 'course', courseId: course.id, authorId: author.id, title: form.title, body: form.body }, author.id)
    toast('Announcement posted to enrolled students.', 'success')
    setForm({ title: '', body: '' })
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end"><Button icon={Plus} onClick={() => setOpen(true)}>Post announcement</Button></div>
      {items.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No announcements" message="Post updates visible to students in this course." action={<Button icon={Plus} onClick={() => setOpen(true)}>Post announcement</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><h3 className="font-bold text-slate-800">{a.title}</h3>{a.pinned && <Badge tone="amber"><Pin size={11} /> Pinned</Badge>}</div>
                  <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                  <p className="mt-2 text-xs text-slate-400">{timeAgo(a.createdAt)}</p>
                </div>
                <IconButton icon={Trash2} title="Delete" onClick={() => { deleteAnnouncement(a.id, author.id); toast('Deleted.', 'info') }} className="hover:text-red-600" />
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={`Announcement — ${course.code}`} subtitle="Visible to enrolled students only."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Post</Button></>}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></FormField>
          <FormField label="Message" required><Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className="min-h-[120px]" /></FormField>
        </form>
      </Modal>
    </div>
  )
}

/* ----------------------------------------------------------------- Assignments */
function AssignmentsTab({ course }) {
  const { assignments, submissions, addAssignment, deleteAssignment } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [del, setDel] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100, attachment: '' })

  const items = assignments.filter((a) => a.courseId === course.id)

  const submit = (e) => {
    e.preventDefault()
    if (!form.title || !form.dueDate) return toast('Enter a title and due date.', 'error')
    addAssignment({ courseId: course.id, title: form.title, description: form.description, dueDate: form.dueDate, maxScore: Number(form.maxScore), attachment: form.attachment || null }, currentUser.id)
    toast('Assignment created.', 'success')
    setForm({ title: '', description: '', dueDate: '', maxScore: 100, attachment: '' })
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end"><Button icon={Plus} onClick={() => setOpen(true)}>Create assignment</Button></div>
      {items.length === 0 ? (
        <Card><EmptyState icon={ClipboardList} title="No assignments" message="Create assignments with deadlines for this course." action={<Button icon={Plus} onClick={() => setOpen(true)}>Create assignment</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => {
            const subs = submissions.filter((s) => s.assignmentId === a.id)
            const graded = subs.filter((s) => s.status === 'graded').length
            return (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800">{a.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{a.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge tone="brand"><Clock size={11} /> Due {formatDate(a.dueDate)}</Badge>
                      <Badge tone="slate">{a.maxScore} pts</Badge>
                      <Badge tone="sky">{subs.length} submitted</Badge>
                      <Badge tone="emerald">{graded} graded</Badge>
                    </div>
                  </div>
                  <IconButton icon={Trash2} title="Delete" onClick={() => setDel(a)} className="hover:text-red-600" />
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={`New Assignment — ${course.code}`} size="lg"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></>}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Build a REST API" /></FormField>
          <FormField label="Description"><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Due date" required><Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></FormField>
            <FormField label="Max score"><Input type="number" value={form.maxScore} onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))} /></FormField>
          </div>
          <FormField label="Attachment (optional)"><Input value={form.attachment} onChange={(e) => setForm((f) => ({ ...f, attachment: e.target.value }))} placeholder="brief.pdf" /></FormField>
        </form>
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { deleteAssignment(del.id, currentUser.id); toast('Assignment deleted.', 'info') }}
        title="Delete assignment?" message={del ? `Remove "${del.title}" and its submissions?` : ''} confirmLabel="Delete" />
    </div>
  )
}

/* ----------------------------------------------------------------- Attendance */
function AttendanceTab({ course, roster }) {
  const { attendance, saveAttendance } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [topic, setTopic] = useState('')
  const [present, setPresent] = useState({})

  const records = attendance.filter((a) => a.courseId === course.id).sort((a, b) => new Date(b.date) - new Date(a.date))

  const startSession = () => {
    setDate(new Date().toISOString().slice(0, 10))
    setTopic('')
    setPresent(Object.fromEntries(roster.map((s) => [s.id, true])))
    setOpen(true)
  }

  const save = (e) => {
    e.preventDefault()
    if (!date) return toast('Pick a date.', 'error')
    saveAttendance({ courseId: course.id, date, topic: topic || 'Lecture', records: roster.map((s) => ({ studentId: s.id, present: !!present[s.id] })) }, currentUser.id)
    toast('Attendance recorded.', 'success')
    setOpen(false)
  }

  const rate = (rec) => {
    const p = rec.records.filter((r) => r.present).length
    return Math.round((p / rec.records.length) * 100)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end"><Button icon={Plus} onClick={startSession} disabled={roster.length === 0}>Take attendance</Button></div>
      {records.length === 0 ? (
        <Card><EmptyState icon={CalendarCheck} title="No attendance records" message="Record attendance after each lecture session." action={roster.length > 0 && <Button icon={Plus} onClick={startSession}>Take attendance</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <Card key={rec.id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{rec.topic}</p>
                  <p className="text-xs text-slate-400">{formatDate(rec.date, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <Badge tone={rate(rec) >= 80 ? 'emerald' : rate(rec) >= 60 ? 'amber' : 'red'}>{rate(rec)}% present</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {rec.records.map((r) => {
                  const stu = roster.find((s) => s.id === r.studentId)
                  return (
                    <span key={r.studentId} className={classNames('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', r.present ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                      {r.present ? <Check size={12} /> : <X size={12} />} {stu ? stu.firstName + ' ' + stu.lastName[0] + '.' : 'Student'}
                    </span>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={`Attendance — ${course.code}`} size="lg"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button icon={Save} onClick={save}>Save attendance</Button></>}>
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

/* ----------------------------------------------------------------- Grades */
function GradesTab({ course, roster }) {
  const { grades, setFinalGrade } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [scores, setScores] = useState({})

  const gradeFor = (sid) => grades.find((g) => g.studentId === sid && g.courseId === course.id)

  const save = (sid) => {
    const val = scores[sid]
    if (val === undefined || val === '') return toast('Enter a score.', 'error')
    const num = Number(val)
    if (isNaN(num) || num < 0 || num > 100) return toast('Score must be 0–100.', 'error')
    setFinalGrade(sid, course.id, num, currentUser.id)
    toast('Final grade saved.', 'success')
    setScores((s) => ({ ...s, [sid]: '' }))
  }

  if (roster.length === 0) return <Card><EmptyState icon={GraduationCap} title="No students" message="Enroll students to enter grades." /></Card>

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Final Grade Entry" subtitle="Enter or update final grades (0–100). Letter & GPA points are computed automatically." icon={GraduationCap} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Student</th><th className="px-5 py-3">Current</th>
              <th className="px-5 py-3">New score</th><th className="px-5 py-3">Letter</th><th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((s) => {
              const g = gradeFor(s.id)
              const preview = scores[s.id] !== undefined && scores[s.id] !== '' ? scoreToLetter(Number(scores[s.id])) : null
              return (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar user={s} size="sm" /><div><p className="font-semibold text-slate-700">{fullName(s)}</p><p className="text-xs text-slate-400">{s.studentId}</p></div></div></td>
                  <td className="px-5 py-3">
                    {g && g.status === 'final' ? (
                      <span className={classNames('font-bold', gradeColor(g.letter))}>{g.letter} · {g.score}</span>
                    ) : <StatusBadge status="in-progress" />}
                  </td>
                  <td className="px-5 py-3">
                    <input type="number" min="0" max="100" value={scores[s.id] ?? ''} onChange={(e) => setScores((sc) => ({ ...sc, [s.id]: e.target.value }))}
                      className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" placeholder="0–100" />
                  </td>
                  <td className="px-5 py-3">{preview ? <span className={classNames('font-bold', gradeColor(preview))}>{preview}</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3 text-right"><Button size="sm" icon={Save} onClick={() => save(s.id)}>Save</Button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
