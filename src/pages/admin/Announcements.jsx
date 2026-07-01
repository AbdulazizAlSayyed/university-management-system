import { useState } from 'react'
import { Megaphone, Plus, Trash2, Pin, Globe } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import {
  PageHeader, Card, Button, IconButton, Badge, Modal, FormField, Input, Textarea, EmptyState,
} from '../../components/ui'
import { formatDate, timeAgo } from '../../utils/helpers'

export default function AdminAnnouncements() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', pinned: false })

  const systemAnns = announcements
    .filter((a) => a.scope === 'system')
    .sort((a, b) => (b.pinned - a.pinned) || new Date(b.createdAt) - new Date(a.createdAt))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title || !form.body) return toast('Please enter a title and message.', 'error')
    addAnnouncement({ ...form, scope: 'system', courseId: null, authorId: currentUser.id }, currentUser.id)
    toast('Announcement posted to all users.', 'success')
    setForm({ title: '', body: '', pinned: false })
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="System Announcements"
        subtitle="Post announcements visible to all users across the platform."
        icon={Megaphone}
        actions={<Button icon={Plus} onClick={() => setModalOpen(true)}>New announcement</Button>}
      />

      {systemAnns.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No announcements" message="Post your first system-wide announcement." action={<Button icon={Plus} onClick={() => setModalOpen(true)}>New announcement</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {systemAnns.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Globe size={19} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">{a.title}</h3>
                      {a.pinned && <Badge tone="amber"><Pin size={11} /> Pinned</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                    <p className="mt-2 text-xs text-slate-400">Posted {formatDate(a.createdAt)} · {timeAgo(a.createdAt)}</p>
                  </div>
                </div>
                <IconButton icon={Trash2} title="Delete" onClick={() => { deleteAnnouncement(a.id); toast('Announcement deleted.', 'info') }} className="hover:text-red-600" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New System Announcement"
        subtitle="This will be visible to every user."
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={submit}>Post announcement</Button></>}
      >
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Registration Deadline" /></FormField>
          <FormField label="Message" required><Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Write your announcement…" className="min-h-[120px]" /></FormField>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Pin this announcement to the top
          </label>
        </form>
      </Modal>
    </div>
  )
}
