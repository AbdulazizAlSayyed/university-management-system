import { useState, useMemo } from 'react'
import { Megaphone, Plus, Trash2, Pin } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, Button, IconButton, Badge, Modal, FormField, Input, Textarea,
  Select, EmptyState,
} from '../../components/ui'
import { formatDate, timeAgo } from '../../utils/helpers'

export default function ProfessorAnnouncements() {
  const { courses = [], announcements = [], addAnnouncement, deleteAnnouncement } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ courseId: '', title: '', body: '' })

  // Safely memoize professor's course list
  const myCourses = useMemo(() => {
    return courses.filter((c) => c?.professorId === currentUser?.id)
  }, [courses, currentUser])

  // Memoize course IDs for quick cross-referencing
  const myCourseIds = useMemo(() => {
    return new Set(myCourses.map((c) => c?.id))
  }, [myCourses])

  // Map courses out to avoid scanning arrays inside the .map loop below
  const courseById = useMemo(() => {
    return Object.fromEntries(courses.map((c) => [c?.id, c]))
  }, [courses])

  // Filter and sort relevant announcements
  const items = useMemo(() => {
    return announcements
      .filter((a) => a?.scope === 'course' && myCourseIds.has(a?.courseId))
      .sort((a, b) => (b?.pinned - a?.pinned) || new Date(b?.createdAt) - new Date(a?.createdAt))
  }, [announcements, myCourseIds])

  const submit = (e) => {
    e.preventDefault()
    if (!form.courseId || !form.title || !form.body) {
      return toast('Course, title, and message are required.', 'error')
    }
    
    addAnnouncement({ 
      scope: 'course', 
      courseId: form.courseId, 
      authorId: currentUser?.id, 
      title: form.title, 
      body: form.body 
    }, currentUser?.id)
    
    toast('Announcement posted.', 'success')
    setForm({ courseId: '', title: '', body: '' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Course Announcements"
        subtitle="Post announcements to students in your courses."
        icon={Megaphone}
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>New announcement</Button>}
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState 
            icon={Megaphone} 
            title="No announcements" 
            message="Post updates for your enrolled students." 
            action={<Button icon={Plus} onClick={() => setOpen(true)}>New announcement</Button>} 
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a?.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{courseById[a?.courseId]?.code || 'Course'}</Badge>
                    <h3 className="font-bold text-slate-800">{a?.title}</h3>
                    {a?.pinned && <Badge tone="amber"><Pin size={11} /> Pinned</Badge>}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{a?.body}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Posted {formatDate(a?.createdAt)} · {timeAgo(a?.createdAt)}
                  </p>
                </div>
                <IconButton 
                  icon={Trash2} 
                  title="Delete" 
                  onClick={() => { deleteAnnouncement(a?.id, currentUser?.id); toast('Deleted.', 'info') }} 
                  className="hover:text-red-600" 
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        open={open} 
        onClose={() => setOpen(false)} 
        title="New Course Announcement"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Post</Button></>}
      >
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Course" required>
            <Select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}>
              <option value="">Select a course…</option>
              {myCourses.map((c) => (
                <option key={c?.id} value={c?.id}>{c?.code} — {c?.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Title" required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Message" required>
            <Textarea 
              value={form.body} 
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} 
              className="min-h-[120px]" 
            />
          </FormField>
        </form>
      </Modal>
    </div>
  )
}