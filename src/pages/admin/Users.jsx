import { useState, useMemo } from 'react'
import {
  Users as UsersIcon, Plus, Pencil, Trash2, UserCheck, UserX, Search,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, Button, IconButton, Avatar, StatusBadge, Badge, Modal, ConfirmDialog,
  FormField, Input, Select, SearchInput, EmptyState,
} from '../../components/ui'
import { fullName, formatDate, classNames } from '../../utils/helpers'

const EMPTY = { role: 'student', firstName: '', lastName: '', email: '', username: '', phone: '', password: 'Welcome@123', department: '', title: '', studentId: '', program: '', year: 1 }

function UserFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.firstName) err.firstName = 'Required'
    if (!form.lastName) err.lastName = 'Required'
    if (!form.email) err.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Invalid email'
    if (!form.username) err.username = 'Required'
    setErrors(err)
    if (Object.keys(err).length) return
    onSave(form)
  }

  const isStudent = form.role === 'student'
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit User' : 'Create User'}
      subtitle={initial ? 'Update account details' : 'New accounts start as “pending” until activated.'}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{initial ? 'Save changes' : 'Create user'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Role">
          <Select value={form.role} onChange={set('role')} disabled={!!initial}>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
            <option value="admin">Administrator</option>
          </Select>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" required error={errors.firstName}><Input value={form.firstName} onChange={set('firstName')} error={errors.firstName} /></FormField>
          <FormField label="Last name" required error={errors.lastName}><Input value={form.lastName} onChange={set('lastName')} error={errors.lastName} /></FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" required error={errors.email}><Input type="email" value={form.email} onChange={set('email')} error={errors.email} /></FormField>
          <FormField label="Username" required error={errors.username}><Input value={form.username} onChange={set('username')} error={errors.username} /></FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone"><Input value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" /></FormField>
          {!initial && <FormField label="Temporary password" hint="Shared with the user on activation."><Input value={form.password} onChange={set('password')} /></FormField>}
        </div>

        {isStudent ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Student ID"><Input value={form.studentId} onChange={set('studentId')} placeholder="STU-2026-0001" /></FormField>
            <FormField label="Program" className="sm:col-span-2"><Input value={form.program} onChange={set('program')} placeholder="BSc Computer Science" /></FormField>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Department"><Input value={form.department} onChange={set('department')} placeholder="Computer Science" /></FormField>
            <FormField label="Title"><Input value={form.title} onChange={set('title')} placeholder="Associate Professor" /></FormField>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default function AdminUsers() {
  const { users, addUser, updateUser, deleteUser, setUserStatus } = useData()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return fullName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.studentId || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (u) => { setEditing(u); setModalOpen(true) }

  const handleSave = (form) => {
    if (editing) {
      updateUser(editing.id, form)
      toast('User updated.', 'success')
    } else {
      addUser(form)
      toast('User created and set to pending.', 'success')
    }
    setModalOpen(false)
  }

  const roleTone = { admin: 'brand', professor: 'emerald', student: 'violet' }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Create, edit, activate, and manage all accounts."
        icon={UsersIcon}
        actions={<Button icon={Plus} onClick={openCreate}>Add user</Button>}
      />

      {/* Filters */}
      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            className="flex-1"
            placeholder="Search by name, email, or student ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select className="sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="professor">Professors</option>
            <option value="admin">Admins</option>
          </Select>
          <Select className="sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No users found" message="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-700">{fullName(u)}</p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Badge tone={roleTone[u.role]}>{u.role}</Badge></td>
                    <td className="px-5 py-3 text-slate-500">
                      {u.role === 'student' ? (u.studentId || '—') : (u.department || '—')}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {u.status === 'active' ? (
                          <IconButton icon={UserX} title="Deactivate" onClick={() => { setUserStatus(u.id, 'inactive'); toast(`${fullName(u)} deactivated.`, 'info') }} className="hover:text-amber-600" />
                        ) : (
                          <IconButton icon={UserCheck} title="Activate" onClick={() => { setUserStatus(u.id, 'active'); toast(`${fullName(u)} activated.`, 'success') }} className="hover:text-emerald-600" />
                        )}
                        <IconButton icon={Pencil} title="Edit" onClick={() => openEdit(u)} className="hover:text-brand-600" />
                        <IconButton icon={Trash2} title="Delete" onClick={() => setConfirmDel(u)} className="hover:text-red-600" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="mt-3 text-xs text-slate-400">Showing {filtered.length} of {users.length} accounts</p>

      {modalOpen && (
        <UserFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initial={editing}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => { deleteUser(confirmDel.id); toast('User deleted.', 'info') }}
        title="Delete user?"
        message={confirmDel ? `This will permanently remove ${fullName(confirmDel)} and their enrollments. This cannot be undone.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
