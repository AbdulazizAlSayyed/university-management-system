import { Users, Clock, MapPin, User } from 'lucide-react'
import { Card } from './ui'
import { classNames } from '../utils/helpers'

const ACCENT_COLORS = [
  'from-brand-500 to-brand-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-sky-500 to-sky-600',
  'from-violet-500 to-violet-600',
  'from-cyan-500 to-cyan-600',
  'from-orange-500 to-orange-600',
]

export default function CourseCard({ course, professorName, enrolledCount, footer, onClick, right, index = 0 }) {
  const accent = ACCENT_COLORS[course.code?.length % ACCENT_COLORS.length]
  const fill = enrolledCount != null ? (enrolledCount / course.capacity) * 100 : 0
  const almostFull = fill >= 80

  return (
    <Card
      className={classNames(
        'group overflow-hidden transition-all duration-200 hover:-translate-y-1',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className={classNames('h-1.5 w-full bg-gradient-to-r', course.color || accent)} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {course.code}
          </span>
          {right}
        </div>

        <h3 className="mt-3 text-base font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
          {course.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-400">{course.credits} credits</p>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{course.description}</p>

        <div className="mt-4 space-y-1.5 text-xs text-slate-500">
          {professorName && (
            <span className="flex items-center gap-1.5">
              <User size={13} className="shrink-0 text-slate-400" />
              <span className="truncate">{professorName}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="shrink-0 text-slate-400" />
            <span className="truncate">{course.schedule || 'TBD'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-slate-400" />
            <span className="truncate">{course.room || 'TBD'}</span>
          </span>
        </div>

        {enrolledCount != null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Users size={13} /> {enrolledCount}/{course.capacity}
              </span>
              <span className={classNames('font-semibold', almostFull ? 'text-rose-600' : 'text-emerald-600')}>
                {Math.round(fill)}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={classNames(
                  'h-full rounded-full transition-all duration-500',
                  almostFull ? 'bg-rose-500' : fill > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(100, Math.max(0, fill))}%` }}
              />
            </div>
          </div>
        )}

        {footer && <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div>}
      </div>
    </Card>
  )
}
