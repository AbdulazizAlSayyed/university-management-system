import { GRADE_SCALE } from '../data/mockData'

// ----- Names & initials -----
export const fullName = (u) => (u ? `${u.firstName} ${u.lastName}` : 'Unknown')

export const initials = (u) => {
  if (!u) return '?'
  return `${(u.firstName || '')[0] || ''}${(u.lastName || '')[0] || ''}`.toUpperCase()
}

// ----- Dates -----
export const formatDate = (dateStr, opts) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', opts || { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// Relative time e.g. "2 days ago"
export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date('2026-10-06T12:00:00') // fixed "today" for the demo
  const diff = Math.round((now - d) / 1000)
  const abs = Math.abs(diff)
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ]
  for (const [name, secs] of units) {
    const v = Math.floor(abs / secs)
    if (v >= 1) return `${v} ${name}${v > 1 ? 's' : ''} ${diff < 0 ? 'from now' : 'ago'}`
  }
  return 'just now'
}

export const daysUntil = (dateStr) => {
  const d = new Date(dateStr)
  const now = new Date('2026-10-06T00:00:00')
  return Math.ceil((d - now) / 86400000)
}

// ----- Grades / GPA -----
export const scoreToLetter = (score) => {
  if (score == null) return null
  const row = GRADE_SCALE.find((g) => score >= g.min)
  return row ? row.letter : 'F'
}

export const scoreToPoints = (score) => {
  if (score == null) return null
  const row = GRADE_SCALE.find((g) => score >= g.min)
  return row ? row.points : 0
}

// Weighted GPA from finalized grades + course credit map
export const calculateGPA = (studentGrades, courseById) => {
  const finals = studentGrades.filter((g) => g.status === 'final' && g.points != null)
  if (finals.length === 0) return { gpa: 0, credits: 0 }
  let totalPoints = 0
  let totalCredits = 0
  finals.forEach((g) => {
    const credits = courseById[g.courseId]?.credits || 0
    totalPoints += g.points * credits
    totalCredits += credits
  })
  return {
    gpa: totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0,
    credits: totalCredits,
  }
}

export const gradeColor = (letter) => {
  if (!letter) return 'text-slate-400'
  if (letter.startsWith('A')) return 'text-emerald-600'
  if (letter.startsWith('B')) return 'text-brand-600'
  if (letter.startsWith('C')) return 'text-amber-600'
  return 'text-red-600'
}

// ----- Misc -----
export const classNames = (...arr) => arr.filter(Boolean).join(' ')

export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export const fileTypeMeta = (type) => {
  const map = {
    pdf: { label: 'PDF', color: 'bg-red-100 text-red-700' },
    docx: { label: 'DOCX', color: 'bg-brand-100 text-brand-700' },
    pptx: { label: 'PPTX', color: 'bg-orange-100 text-orange-700' },
    mp4: { label: 'VIDEO', color: 'bg-purple-100 text-purple-700' },
    link: { label: 'LINK', color: 'bg-sky-100 text-sky-700' },
  }
  return map[type] || { label: 'FILE', color: 'bg-slate-100 text-slate-700' }
}
