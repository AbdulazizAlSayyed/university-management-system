import { useState, useMemo } from 'react'
import { PenSquare, FileText, Download, Check } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, Button, Avatar, Badge, StatusBadge, Tabs, Modal, FormField,
  Input, Textarea, EmptyState,
} from '../../components/ui'
import { fullName, formatDate } from '../../utils/helpers'

export default function ProfessorGrading() {
  const { courses = [], assignments = [], submissions = [], users = [], gradeSubmission } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState('pending')
  const [grading, setGrading] = useState(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')

  // Safely memoize course definitions and user hashes
  const myCourseIds = useMemo(() => {
    return new Set(courses.filter((c) => c?.professorId === currentUser?.id).map((c) => c?.id))
  }, [courses, currentUser])

  const myAssignments = useMemo(() => {
    return assignments.filter((a) => myCourseIds.has(a?.courseId))
  }, [assignments, myCourseIds])

  const myAssignmentIds = useMemo(() => {
    return new Set(myAssignments.map((a) => a?.id))
  }, [myAssignments])

  const asgById = useMemo(() => Object.fromEntries(assignments.map((a) => [a?.id, a])), [assignments])
  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c?.id, c])), [courses])
  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u?.id, u])), [users])

  // Split submissions dynamically by status
  const mySubs = useMemo(() => {
    return submissions.filter((s) => myAssignmentIds.has(s?.assignmentId))
  }, [submissions, myAssignmentIds])

  const pending = useMemo(() => mySubs.filter((s) => s?.status === 'submitted'), [mySubs])
  const graded = useMemo(() => mySubs.filter((s) => s?.status === 'graded'), [mySubs])
  
  const list = useMemo(() => {
    return tab === 'pending' ? pending : tab === 'graded' ? graded : mySubs
  }, [tab, pending, graded, mySubs])

  const openGrade = (s) => {
    setGrading(s)
    setScore(s?.score ?? '')
    setFeedback(s?.feedback ?? '')
  }

  const submitGrade = (e) => {
    e.preventDefault()
    if (!grading) return

    const asg = asgById[grading?.assignmentId]
    const max = asg?.maxScore || 100
    const num = Number(score)

    if (score === '' || isNaN(num) || num < 0 || num > max) {
      return toast(`Score must be 0–${max}.`, 'error')
    }

    gradeSubmission(grading?.id, num, feedback, currentUser?.id)
    toast('Submission graded.', 'success')
    setGrading(null)
  }

  const tabs = [
    { value: 'pending', label: 'To Grade', icon: PenSquare, count: pending.length },
    { value: 'graded', label: 'Graded', icon: Check, count: graded.length },
    { value: 'all', label: 'All', icon: FileText, count: mySubs.length },
  ]

  return (
    <div>
      <PageHeader title="Grade Submissions" subtitle="Review student submissions and assign scores with feedback." icon={PenSquare} />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mt-6">
        {list.length === 0 ? (
          <Card>
            <EmptyState 
              icon={PenSquare} 
              title={tab === 'pending' ? 'Nothing to grade' : 'No submissions'} 
              message={tab === 'pending' ? 'All submissions have been graded.' : 'Submissions will appear here.'} 
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((s) => {
              const stu = userById[s?.studentId]
              const asg = asgById[s?.assignmentId]
              const course = asg ? courseById[asg?.courseId] : null
              return (
                <Card key={s?.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <Avatar user={stu} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-700">{stu ? fullName(stu) : '—'}</p>
                      {course && <Badge tone="brand">{course?.code}</Badge>}
                      <StatusBadge status={s?.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{asg?.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><FileText size={12} /> {s?.fileName}</span> · Submitted {formatDate(s?.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s?.status === 'graded' && (
                      <span className="text-right">
                        <span className="block text-lg font-bold text-slate-800">
                          {s?.score}
                          <span className="text-sm font-normal text-slate-400">/{asg?.maxScore || 100}</span>
                        </span>
                      </span>
                    )}
                    <Button 
                      size="sm" 
                      variant={s?.status === 'graded' ? 'secondary' : 'primary'} 
                      icon={s?.status === 'graded' ? PenSquare : Check} 
                      onClick={() => openGrade(s)}
                    >
                      {s?.status === 'graded' ? 'Edit' : 'Grade'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Grade modal */}
      <Modal
        open={!!grading}
        onClose={() => setGrading(null)}
        title="Grade Submission"
        subtitle={grading ? asgById[grading?.assignmentId]?.title : ''}
        footer={<><Button variant="secondary" onClick={() => setGrading(null)}>Cancel</Button><Button onClick={submitGrade} icon={Check}>Save grade</Button></>}
      >
        {grading && (
          <form onSubmit={submitGrade} className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <Avatar user={userById[grading?.studentId]} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700">{fullName(userById[grading?.studentId])}</p>
                <p className="truncate text-xs text-slate-400"><FileText size={11} className="inline" /> {grading?.fileName}</p>
              </div>
              <Button size="sm" variant="ghost" icon={Download} type="button" onClick={() => toast('Download started (demo).', 'info')}>File</Button>
            </div>
            <FormField label={`Score (out of ${asgById[grading?.assignmentId]?.maxScore || 100})`} required>
              <Input 
                type="number" 
                min="0" 
                max={asgById[grading?.assignmentId]?.maxScore || 100} 
                value={score} 
                onChange={(e) => setScore(e.target.value)} 
                placeholder="0" 
              />
            </FormField>
            <FormField label="Feedback">
              <Textarea 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)} 
                placeholder="Write constructive feedback for the student…" 
                className="min-h-[110px]" 
              />
            </FormField>
          </form>
        )}
      </Modal>
    </div>
  )
}