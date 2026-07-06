import { useEffect } from 'react'
import { X, Search, Inbox, Loader2, UploadCloud } from 'lucide-react'
import { classNames } from '../../utils/helpers'

// ------------------------------------------------------------------ Button
const BTN_VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500/40 shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400/40',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400/30',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/40 shadow-sm',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus:ring-brand-500/30',
}
const BTN_SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
}
export function Button({ variant = 'primary', size = 'md', icon: Icon, children, className, ...props }) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none',
        BTN_VARIANTS[variant], BTN_SIZES[size], className
      )}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 15 : 18} />}
      {children}
    </button>
  )
}

export function IconButton({ icon: Icon, className, size = 18, ...props }) {
  return (
    <button
      className={classNames('inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400/30', className)}
      {...props}
    >
      <Icon size={size} />
    </button>
  )
}

// ------------------------------------------------------------------ Card
export function Card({ className, children, ...props }) {
  return (
    <div className={classNames('rounded-xl border border-slate-200 bg-white shadow-card', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div className={classNames('flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <Card className="p-5 transition hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <span className={classNames('grid h-11 w-11 place-items-center rounded-xl', tones[tone])}>
            <Icon size={22} />
          </span>
        )}
      </div>
    </Card>
  )
}

// ------------------------------------------------------------------ Badge
const BADGE_TONES = {
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  sky: 'bg-sky-100 text-sky-700',
  violet: 'bg-violet-100 text-violet-700',
}
export function Badge({ tone = 'slate', children, className, dot = false }) {
  return (
    <span className={classNames('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', BADGE_TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    active: { tone: 'emerald', label: 'Active' },
    pending: { tone: 'amber', label: 'Pending' },
    inactive: { tone: 'red', label: 'Inactive' },
    enrolled: { tone: 'emerald', label: 'Enrolled' },
    submitted: { tone: 'sky', label: 'Submitted' },
    graded: { tone: 'emerald', label: 'Graded' },
    missing: { tone: 'red', label: 'Missing' },
    'in-progress': { tone: 'amber', label: 'In progress' },
    final: { tone: 'emerald', label: 'Final' },
  }
  const s = map[status] || { tone: 'slate', label: status }
  return <Badge tone={s.tone} dot>{s.label}</Badge>
}

// ------------------------------------------------------------------ Avatar
export function Avatar({ user, size = 'md', className }) {
  const sizes = { xs: 'h-7 w-7 text-xs', sm: 'h-9 w-9 text-sm', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }
  const inits = user ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() : '?'
  return (
    <span className={classNames('inline-grid place-items-center rounded-full font-semibold text-white shrink-0', user?.avatarColor || 'bg-slate-400', sizes[size], className)}>
      {inits}
    </span>
  )
}

// ------------------------------------------------------------------ Form fields
export function FormField({ label, error, required, children, hint, className }) {
  return (
    <div className={className}>
      {label && (
        <label className="field-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}

export function Input({ error, className, ...props }) {
  return <input className={classNames('field-input', error && 'field-input-error', className)} {...props} />
}

export function Textarea({ error, className, ...props }) {
  return <textarea className={classNames('field-input min-h-[96px] resize-y', error && 'field-input-error', className)} {...props} />
}

export function Select({ error, className, children, ...props }) {
  return (
    <select className={classNames('field-input appearance-none bg-white', error && 'field-input-error', className)} {...props}>
      {children}
    </select>
  )
}

// ------------------------------------------------------------------ SearchInput
export function SearchInput({ className, ...props }) {
  return (
    <div className={classNames('relative', className)}>
      <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input className="field-input pl-9" {...props} />
    </div>
  )
}

// ------------------------------------------------------------------ Empty / Loading
export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={26} />
      </span>
      <h3 className="mt-4 font-semibold text-slate-700">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner({ className, size = 22 }) {
  return <Loader2 size={size} className={classNames('animate-spin text-brand-600', className)} />
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner /> <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

// ------------------------------------------------------------------ PageHeader
export function PageHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Icon size={22} />
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ------------------------------------------------------------------ Progress
export function ProgressBar({ value = 0, tone = 'brand', className }) {
  const tones = { brand: 'bg-brand-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' }
  return (
    <div className={classNames('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div className={classNames('h-full rounded-full transition-all', tones[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

// ------------------------------------------------------------------ Tabs
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={classNames(
            'relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
            active === t.value ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <span className="flex items-center gap-1.5">
            {t.icon && <t.icon size={16} />}
            {t.label}
            {t.count != null && (
              <span className={classNames('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', active === t.value ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500')}>
                {t.count}
              </span>
            )}
          </span>
          {active === t.value && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />}
        </button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ Modal
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={classNames('relative z-10 w-full animate-fade-in rounded-2xl bg-white shadow-xl', sizes[size])}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <IconButton icon={X} onClick={onClose} />
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'danger' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={tone} onClick={() => { onConfirm?.(); onClose?.() }}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  )
}

// ------------------------------------------------------------------ FileDropzone (mock)
export function FileDropzone({ onFile, hint = 'PDF, DOCX, PPTX, MP4 — up to 50 MB', fileName }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 text-brand-600">
        <UploadCloud size={22} />
      </span>
      {fileName ? (
        <p className="text-sm font-semibold text-slate-700">{fileName}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-600">
            <span className="text-brand-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-400">{hint}</p>
        </>
      )}
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile?.(f.name)
        }}
      />
    </label>
  )
}
