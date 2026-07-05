import { useState, useMemo } from 'react'
import { ClipboardList, Plus, Clock, Trash2, PenSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, Button, IconButton, Badge, Modal, ConfirmDialog, FormField,
  Input, Textarea, Select, EmptyState,
} from '../../components/ui'
import { formatDate, daysUntil } from '../../utils/helpers'

export default function ProfessorAssignments() {
  const { courses = [], assignments = [], submissions = [], addAssignment, deleteAssignment } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [del, setDel] = useState(null)
  const [courseFilter, setCourseFilter] = useState('all')
  const [form, setForm] = useState({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100 })

  // Memoized lists with defensive checks
  const myCourses = useMemo(() => {
    return courses.filter((c) => c?.professorId === currentUser?.id)
  }, [courses, currentUser])

  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c?.id)), [myCourses])

  const courseById = useMemo(() => {
    return Object.fromEntries(courses.map((c) => [c?.id, c]))
  }, [courses])

  const items = useMemo(() => {
    return assignments
      .filter((a) => myCourseIds.has(a?.courseId))
      .filter((a) => courseFilter === 'all' || a?.courseId === courseFilter)
      .sort((a, b) => new Date(b?.dueDate) - new Date(a?.dueDate))
  }, [assignments, myCourseIds, courseFilter])

  const submit = (e) => {
    e.preventDefault()
    if (!form.courseId || !form.title || !form.dueDate) {
      return toast('Course, title, and due date are required.', 'error')
    }
    addAssignment({ ...form, maxScore: Number(form.maxScore), attachment: null }, currentUser?.id)
    toast('Assignment created.', 'success')
    setForm({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100 })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="All assignments across your courses."
        icon={ClipboardList}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Create assignment</Button>}
      />

      <Card className="mb-5 p-4">
        <Select className="sm:w-72" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="all">All my courses</option>
          {myCourses.map((c) => <option key={c?.id} value={c?.id}>{c?.code} — {c?.name}</option>)}
        </Select>
      </Card>

      {items.length === 0 ? (
        <Card>
          <EmptyState 
            icon={ClipboardList} 
            title="No assignments" 
            message="Create your first assignment." 
            action={<Button icon={Plus} onClick={() => setOpen(true)}>Create assignment</Button>} 
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => {
            const subs = submissions.filter((s) => s?.assignmentId === a?.id)
            const pending = subs.filter((s) => s?.status === 'submitted').length
            const d = daysUntil(a?.dueDate)
            return (
              <Card key={a?.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="brand">{courseById[a?.courseId]?.code || 'Course'}</Badge>
                      <h3 className="font-bold text-slate-800">{a?.title}</h3>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{a?.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge tone={d < 0 ? 'slate' : d <= 3 ? 'red' : 'amber'}>
                        <Clock size={11} /> {d < 0 ? 'Closed' : d === 0 ? 'Due today' : `Due ${formatDate(a?.dueDate)}`}
                      </Badge>
                      <Badge tone="sky">{subs.length} submitted</Badge>
                      {pending > 0 && <Badge tone="amber">{pending} to grade</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="soft" icon={PenSquare} onClick={() => navigate('/professor/grading')}>Grade</Button>
                    <IconButton icon={Trash2} title="Delete" onClick={() => setDel(a)} className="hover:text-red-600" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Assignment" size="lg"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></>}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Course" required>
            <Select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
              <option value="">Select a course…</option>
              {myCourses.map((c) => <option key={c?.id} value={c?.id}>{c?.code} — {c?.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></FormField>
          <FormField label="Description"><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Due date" required><Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></FormField>
            <FormField label="Max score"><Input type="number" value={form.maxScore} onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))} /></FormField>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        open={!!del} 
        onClose={() => setDel(null)} 
        onConfirm={() => { deleteAssignment(del?.id, currentUser?.id); toast('Deleted.', 'info') }}
        title="Delete assignment?" 
        message={del ? `Remove "${del?.title}"?` : ''} 
        confirmLabel="Delete" 
      />
    </div>
  )
}