import { useState, useMemo } from 'react'
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, Button, IconButton, Modal, ConfirmDialog, FormField, Input,
  Textarea, Select, SearchInput, EmptyState,
} from '../../components/ui'
import CourseCard from '../../components/CourseCard'
import { fullName } from '../../utils/helpers'

const COLORS = ['bg-brand-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500']
const EMPTY = { code: '', name: '', description: '', credits: 3, capacity: 30, professorId: '', schedule: '', room: '', color: 'bg-brand-500' }

function CourseFormModal({ open, onClose, onSave, initial, professors }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.code) err.code = 'Required'
    if (!form.name) err.name = 'Required'
    if (!form.professorId) err.professorId = 'Assign a professor'
    setErrors(err)
    if (Object.keys(err).length) return
    onSave({ ...form, credits: Number(form.credits), capacity: Number(form.capacity) })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Course' : 'Create Course'}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{initial ? 'Save changes' : 'Create course'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Course code" required error={errors.code}><Input value={form.code} onChange={set('code')} placeholder="CS101" error={errors.code} /></FormField>
          <FormField label="Course name" required error={errors.name} className="sm:col-span-2"><Input value={form.name} onChange={set('name')} placeholder="Introduction to Programming" error={errors.name} /></FormField>
        </div>
        <FormField label="Description"><Textarea value={form.description} onChange={set('description')} placeholder="Short course description…" /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Credits"><Select value={form.credits} onChange={set('credits')}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</Select></FormField>
          <FormField label="Capacity"><Input type="number" min="1" value={form.capacity} onChange={set('capacity')} /></FormField>
        </div>
        <FormField label="Assigned professor" required error={errors.professorId}>
          <Select value={form.professorId} onChange={set('professorId')} error={errors.professorId}>
            <option value="">Select a professor…</option>
            {professors.map((p) => <option key={p.id} value={p.id}>{fullName(p)} — {p.department}</option>)}
          </Select>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Schedule"><Input value={form.schedule} onChange={set('schedule')} placeholder="Mon & Wed · 09:00–10:30" /></FormField>
          <FormField label="Room"><Input value={form.room} onChange={set('room')} placeholder="Hall A-101" /></FormField>
        </div>
        <FormField label="Accent color">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`h-8 w-8 rounded-lg ${c} ${form.color === c ? 'ring-2 ring-slate-800 ring-offset-2' : ''}`}
              />
            ))}
          </div>
        </FormField>
      </form>
    </Modal>
  )
}

export default function AdminCourses() {
  const { courses, users, enrollments, addCourse, updateCourse, deleteCourse } = useData()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const professors = users.filter((u) => u.role === 'professor')
  const profById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])

  const filtered = courses.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  })

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setModalOpen(true) }

  const handleSave = (form) => {
    if (editing) { updateCourse(editing.id, form); toast('Course updated.', 'success') }
    else { addCourse(form); toast('Course created.', 'success') }
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Create courses, set capacity, and assign professors."
        icon={BookOpen}
        actions={<Button icon={Plus} onClick={openCreate}>New course</Button>}
      />

      <Card className="mb-5 p-4">
        <SearchInput placeholder="Search courses by code or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Search} title="No courses found" message="Create a course or adjust your search." action={<Button icon={Plus} onClick={openCreate}>New course</Button>} /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              professorName={profById[c.professorId] ? fullName(profById[c.professorId]) : 'Unassigned'}
              enrolledCount={enrollments.filter((e) => e.courseId === c.id).length}
              footer={
                <div className="flex items-center justify-end gap-1">
                  <IconButton icon={Pencil} title="Edit" onClick={() => openEdit(c)} className="hover:text-brand-600" />
                  <IconButton icon={Trash2} title="Delete" onClick={() => setConfirmDel(c)} className="hover:text-red-600" />
                </div>
              }
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <CourseFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} professors={professors} />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => { deleteCourse(confirmDel.id); toast('Course deleted.', 'info') }}
        title="Delete course?"
        message={confirmDel ? `This will remove ${confirmDel.code} — ${confirmDel.name} and all its enrollments.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
