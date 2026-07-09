import { Users, Clock, MapPin, Award } from 'lucide-react'
import { Card, Badge } from './ui'
import { classNames } from '../utils/helpers'

export default function CourseCard({ course, professorName, enrolledCount, footer, onClick, right }) {
  return (
    <Card
      className={classNames('overflow-hidden transition hover:shadow-card-hover', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className={classNames('h-2 w-full', course.color || 'bg-brand-500')} />
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{course.code}</Badge>
              <span className="text-xs font-medium text-slate-400">{course.credits} credits</span>
            </div>
            <h3 className="mt-2 truncate text-base font-bold text-slate-800">{course.name}</h3>
          </div>
          {right}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-500">
          {professorName && (
            <span className="flex items-center gap-1.5 min-w-0">
              <Award size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{professorName}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 min-w-0">
            <Clock size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{course.schedule}</span>
          </span>
          <span className="flex items-center gap-1.5 min-w-0">
            <MapPin size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{course.room}</span>
          </span>
          {enrolledCount != null && (
            <span className="flex items-center gap-1.5 min-w-0">
              <Users size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{enrolledCount}/{course.capacity} enrolled</span>
            </span>
          )}
        </div>

        {footer && <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div>}
      </div>
    </Card>
  )
}
