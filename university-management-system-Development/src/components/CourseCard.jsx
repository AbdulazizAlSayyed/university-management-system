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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge tone="brand">{course.code}</Badge>
              <span className="text-xs font-medium text-slate-400">{course.credits} credits</span>
            </div>
            <h3 className="mt-2 truncate text-base font-bold text-slate-800">{course.name}</h3>
          </div>
          {right}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
          {professorName && (
            <span className="flex items-center gap-1.5">
              <Award size={14} className="text-slate-400" /> {professorName}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" /> {course.schedule}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-400" /> {course.room}
          </span>
          {enrolledCount != null && (
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" /> {enrolledCount}/{course.capacity} enrolled
            </span>
          )}
        </div>

        {footer && <div className="mt-4 border-t border-slate-100 pt-4">{footer}</div>}
      </div>
    </Card>
  )
}
