import { useState, useMemo } from 'react'
import { GraduationCap, Save } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  PageHeader, Card, CardHeader, Button, Avatar, StatusBadge, Select, EmptyState,
} from '../../components/ui'
import { fullName, scoreToLetter, gradeColor, classNames } from '../../utils/helpers'

export default function ProfessorGrades() {
  const { courses, users, enrollments, grades, setFinalGrade } = useData()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const myCourses = courses.filter((c) => c.professorId === currentUser.id)
  const [courseId, setCourseId] = useState(myCourses[0]?.id || '')
  const [scores, setScores] = useState({})

  const roster = useMemo(() => {
    const ids = new Set(enrollments.filter((e) => e.courseId === courseId).map((e) => e.studentId))
    return users.filter((u) => ids.has(u.id))
  }, [enrollments, users, courseId])

  const gradeFor = (sid) => grades.find((g) => g.studentId === sid && g.courseId === courseId)

  const save = (sid) => {
    const val = scores[sid]
    if (val === undefined || val === '') return toast('Enter a score.', 'error')
    const num = Number(val)
    if (isNaN(num) || num < 0 || num > 100) return toast('Score must be 0–100.', 'error')
    setFinalGrade(sid, courseId, num, currentUser.id)
    toast('Final grade saved.', 'success')
    setScores((s) => ({ ...s, [sid]: '' }))
  }

  const saveAll = () => {
    let n = 0
    roster.forEach((s) => {
      const val = scores[s.id]
      if (val !== undefined && val !== '' && !isNaN(Number(val))) {
        setFinalGrade(s.id, courseId, Number(val), currentUser.id)
        n++
      }
    })
    if (n) { toast(`${n} grade${n > 1 ? 's' : ''} saved.`, 'success'); setScores({}) }
    else toast('No scores entered.', 'info')
  }

  return (
    <div>
      <PageHeader
        title="Final Grades"
        subtitle="Enter and submit final grades. Letter grades and GPA points are computed automatically."
        icon={GraduationCap}
        actions={roster.length > 0 && <Button icon={Save} onClick={saveAll}>Save all</Button>}
      />

      <Card className="mb-5 p-4">
        <label className="field-label">Course</label>
        <Select className="sm:w-96" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {myCourses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Grade Sheet" subtitle={`${roster.length} students`} icon={GraduationCap} />
        {roster.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students enrolled" message="This course has no enrolled students yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Student</th><th className="px-5 py-3">Current grade</th>
                  <th className="px-5 py-3">New score (0–100)</th><th className="px-5 py-3">Letter</th><th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((s) => {
                  const g = gradeFor(s.id)
                  const preview = scores[s.id] !== undefined && scores[s.id] !== '' ? scoreToLetter(Number(scores[s.id])) : null
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar user={s} size="sm" /><div><p className="font-semibold text-slate-700">{fullName(s)}</p><p className="text-xs text-slate-400">{s.studentId}</p></div></div></td>
                      <td className="px-5 py-3">
                        {g && g.status === 'final' ? <span className={classNames('font-bold', gradeColor(g.letter))}>{g.letter} · {g.score}</span> : <StatusBadge status="in-progress" />}
                      </td>
                      <td className="px-5 py-3">
                        <input type="number" min="0" max="100" value={scores[s.id] ?? ''} onChange={(e) => setScores((sc) => ({ ...sc, [s.id]: e.target.value }))}
                          className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" placeholder="0–100" />
                      </td>
                      <td className="px-5 py-3">{preview ? <span className={classNames('font-bold', gradeColor(preview))}>{preview}</span> : <span className="text-slate-300">—</span>}</td>
                      <td className="px-5 py-3 text-right"><Button size="sm" icon={Save} onClick={() => save(s.id)}>Save</Button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
