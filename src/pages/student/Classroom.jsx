// Mahmoud (Team Lead) — Classroom: materials, announcements, assignments for one course
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, FileText, Megaphone, ClipboardList, Download, Link as LinkIcon,
  Clock, Upload, CheckCircle2, Pin, Award,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { studentApi, client } from '../../api'
import { useFetch } from '../../hooks/useFetch'
import {
  Card, CardHeader, Button, Badge, StatusBadge, Tabs, Modal, FileDropzone,
  EmptyState, LoadingState,
} from '../../components/ui'
import { fullName, formatDate, timeAgo, daysUntil, fileTypeMeta, classNames } from '../../utils/helpers'

export default function StudentClassroom() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const { data, loading, reload } = useFetch(() => studentApi.getClassroom(courseId))
  const [submitFor, setSubmitFor] = useState(null)
  const [fileName, setFileName] = useState('')

  const requestedTab = new URLSearchParams(location.search).get('tab')
  const [tab, setTab] = useState(() => {
    if (requestedTab && ['materials', 'announcements', 'assignments'].includes(requestedTab)) return requestedTab
    return 'materials'
  })

  useEffect(() => {
    if (requestedTab && ['materials', 'announcements', 'assignments'].includes(requestedTab)) {
      setTab(requestedTab)
    }
  }, [requestedTab])

  const byWeek = useMemo(() => {
    if (!data) return {}
    const g = {}
    ;(data.materials || []).forEach((m) => { (g[m.week] = g[m.week] || []).push(m) })
    return g
  }, [data])

  const handleTabChange = (nextTab) => {
    setTab(nextTab)
    navigate({ pathname: `/student/courses/${courseId}`, search: `?tab=${nextTab}` }, { replace: true })
  }

  if (loading) return <LoadingState label="Loading classroom…" />
  if (!data) {
    return <Card><EmptyState icon={FileText} title="Course unavailable" message="You are not enrolled in this course." action={<Button onClick={() => navigate('/student/courses')}>Back to my courses</Button>} /></Card>
  }

  const { course, professor, materials, announcements: courseAnns, assignments: courseAssignments, submissions } = data

  const mySub = (aid) => (submissions || []).find((s) => s.assignmentId === aid && s.studentId === currentUser.id)

  const doSubmit = async () => {
    if (!fileName) return toast('Attach a file to submit.', 'error')
    try {
      await studentApi.submitAssignment(submitFor.id, fileName)
      toast('Assignment submitted!', 'success')
      setSubmitFor(null)
      setFileName('')
      reload()
    } catch { toast('Failed to submit.', 'error') }
  }

  const sortedAnns = (courseAnns || []).sort((a, b) => (b.pinned - a.pinned) || new Date(b.createdAt) - new Date(a.createdAt))

  const tabs = [
    { value: 'materials', label: 'Materials', icon: FileText, count: (materials || []).length },
    { value: 'announcements', label: 'Announcements', icon: Megaphone, count: sortedAnns.length },
    { value: 'assignments', label: 'Assignments', icon: ClipboardList, count: (courseAssignments || []).length },
  ]

  return (
    <div>
      <button onClick={() => navigate('/student/courses')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to My Courses
      </button>

      <Card className="mb-6 overflow-hidden">
        <div className={classNames('h-2 w-full', course?.color || 'bg-brand-500')} />
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Badge tone="brand">{course?.code}</Badge>
            <span className="text-xs text-slate-400">{course?.credits} credits</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{course?.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Award size={14} /> {professor ? fullName(professor) : 'TBA'}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {course?.schedule}</span>
            <span>{course?.room}</span>
          </p>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={handleTabChange} />

      <div className="mt-6">
        {tab === 'materials' && (
          !materials || materials.length === 0 ? (
            <Card><EmptyState icon={FileText} title="No materials yet" message="Your professor hasn't uploaded materials for this course." /></Card>
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
                            <p className="truncate text-xs text-slate-400">{m.fileName || m.link} {m.size ? `· ${m.size}` : ''}</p>
                          </div>
                          <Button size="sm" variant="soft" icon={m.type === 'link' ? LinkIcon : Download} onClick={async () => {
                            if (m.type === 'link' && m.link) { window.open(m.link, '_blank'); return }
                            try {
                              const res = await client.get(`/student/materials/${m.id}/download`, { responseType: 'blob' });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = m.fileName || 'download';
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch { toast('Download failed. File may not exist on server.', 'error') }
                          }}>
                            {m.type === 'link' ? 'Open' : 'Download'}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'announcements' && (
          sortedAnns.length === 0 ? (
            <Card><EmptyState icon={Megaphone} title="No announcements" message="No course announcements yet." /></Card>
          ) : (
            <div className="space-y-4">
              {sortedAnns.map((a) => (
                <Card key={a.id} className="p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{a.title}</h3>
                    {a.pinned && <Badge tone="amber"><Pin size={11} /> Pinned</Badge>}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{a.body}</p>
                  <p className="mt-2 text-xs text-slate-400">{professor ? fullName(professor) : 'Professor'} · {timeAgo(a.createdAt)}</p>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'assignments' && (
          !courseAssignments || courseAssignments.length === 0 ? (
            <Card><EmptyState icon={ClipboardList} title="No assignments" message="No assignments have been posted yet." /></Card>
          ) : (
            <div className="space-y-4">
              {courseAssignments.map((a) => {
                const sub = mySub(a.id)
                const d = daysUntil(a.dueDate)
                const closed = d < 0
                return (
                  <Card key={a.id} className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800">{a.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{a.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <Badge tone={closed ? 'slate' : d <= 3 ? 'red' : 'amber'}><Clock size={11} /> {closed ? 'Closed' : d === 0 ? 'Due today' : `Due ${formatDate(a.dueDate)}`}</Badge>
                          <Badge tone="slate">{a.maxScore} pts</Badge>
                          {sub && <StatusBadge status={sub.status} />}
                        </div>
                        {sub?.status === 'graded' && (
                          <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm">
                            <p className="font-semibold text-emerald-800">Score: {sub.score}/{a.maxScore}</p>
                            {sub.feedback && <p className="mt-1 text-emerald-700">"{sub.feedback}"</p>}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {sub ? (
                          <Button variant="secondary" size="sm" icon={Upload} disabled={closed} onClick={() => { setSubmitFor(a); setFileName('') }}>
                            {sub.status === 'graded' ? 'Graded' : 'Resubmit'}
                          </Button>
                        ) : (
                          <Button size="sm" icon={Upload} disabled={closed} onClick={() => { setSubmitFor(a); setFileName('') }}>
                            {closed ? 'Closed' : 'Submit'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )
        )}
      </div>

      <Modal
        open={!!submitFor}
        onClose={() => setSubmitFor(null)}
        title="Submit Assignment"
        subtitle={submitFor?.title}
        footer={<><Button variant="secondary" onClick={() => setSubmitFor(null)}>Cancel</Button><Button icon={CheckCircle2} onClick={doSubmit}>Submit</Button></>}
      >
        <div className="space-y-4">
          {submitFor && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <p className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> Due {formatDate(submitFor.dueDate)} · {submitFor.maxScore} points</p>
            </div>
          )}
          <FileDropzone fileName={fileName} onFile={setFileName} hint="PDF, DOCX, ZIP — up to 50 MB" />
        </div>
      </Modal>
    </div>
  )
}
