// Mahmoud (Team Lead) — Grades: per-course grades + GPA calculations from submissions
import { useMemo } from 'react'
import { GraduationCap, TrendingUp, Award, FileText, Calculator, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { studentApi } from '../../api'
import { useFetch } from '../../hooks/useFetch'
import { PageHeader, Card, CardHeader, StatCard, Badge, StatusBadge, Button, EmptyState, LoadingState } from '../../components/ui'
import { calculateGPA, gradeColor, formatDate, classNames } from '../../utils/helpers'

export default function StudentGrades() {
  const { currentUser } = useAuth()
  const { data, loading, reload } = useFetch(() => studentApi.getGrades())

  const courseById = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries((data.courses || []).map((c) => [c.id, c]))
  }, [data])

  const myGrades = data?.grades || []
  const { gpa, credits } = calculateGPA(myGrades, courseById)
  const finalized = myGrades.filter((g) => g.status === 'final').length
  const myCourses = data?.courses || []

  const subByAsg = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries((data.submissions || []).map((s) => [s.assignmentId, s]))
  }, [data])

  const gradeFor = (cid) => myGrades.find((g) => g.courseId === cid)

  const recalc = async (courseId) => {
    try { await studentApi.calculateGrade(courseId); reload() } catch {}
  }

  if (loading) return <LoadingState label="Loading grades…" />

  return (
    <div>
      <PageHeader title="Grades & GPA" subtitle="Your academic performance — calculated from graded submissions." icon={GraduationCap} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label="Cumulative GPA" value={gpa.toFixed(2)} sub="Out of 4.00" tone="emerald" />
        <StatCard icon={Award} label="Credits Completed" value={credits} sub={`${finalized} finalized courses`} tone="brand" />
        <StatCard icon={FileText} label="Enrolled Courses" value={myCourses.length} sub="This semester" tone="violet" />
      </div>

      {myCourses.length === 0 ? (
        <Card className="mt-6"><EmptyState icon={GraduationCap} title="No grades yet" message="Enroll in courses to start tracking your grades." /></Card>
      ) : (
        <div className="mt-6 space-y-5">
          {myCourses.map((c) => {
            const g = gradeFor(c.id)
            const courseAsgs = (data?.assignments || []).filter((a) => a.courseId === c.id)
            const gradedSubs = courseAsgs.filter((a) => subByAsg[a.id]?.status === 'graded')
            const totalEarned = gradedSubs.reduce((s, a) => s + (subByAsg[a.id]?.score || 0), 0)
            const totalMax = gradedSubs.reduce((s, a) => s + (a.maxScore || 100), 0)
            return (
              <Card key={c.id}>
                <CardHeader
                  title={`${c.code} — ${c.name}`}
                  subtitle={`${c.credits} credits`}
                  icon={GraduationCap}
                  action={
                    <div className="flex items-center gap-3">
                      {g && g.status === 'final' && (
                        <div className="text-right">
                          <span className={classNames('text-2xl font-extrabold', gradeColor(g.letter))}>{g.letter}</span>
                          <p className="text-[11px] text-slate-400">{g.score}%</p>
                        </div>
                      )}
                      {g && g.status === 'final' ? null : <StatusBadge status="in-progress" />}
                      <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => recalc(c.id)} title="Recalculate grade from submissions" />
                    </div>
                  }
                />
                {courseAsgs.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-slate-400">No graded assignments yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <th className="px-5 py-2.5">Assignment</th>
                          <th className="px-5 py-2.5">Due</th>
                          <th className="px-5 py-2.5">Status</th>
                          <th className="px-5 py-2.5 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {courseAsgs.map((a) => {
                          const sub = subByAsg[a.id]
                          return (
                            <tr key={a.id} className="hover:bg-slate-50/60">
                              <td className="px-5 py-2.5 font-medium text-slate-700">{a.title}</td>
                              <td className="px-5 py-2.5 text-slate-500">{formatDate(a.dueDate)}</td>
                              <td className="px-5 py-2.5">{sub ? <StatusBadge status={sub.status} /> : <Badge tone="slate">Not submitted</Badge>}</td>
                              <td className="px-5 py-2.5 text-right">
                                {sub?.status === 'graded'
                                  ? <span className="font-bold text-slate-800">{sub.score}<span className="font-normal text-slate-400">/{a.maxScore}</span></span>
                                  : <span className="text-slate-300">—</span>}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      {gradedSubs.length > 0 && (
                        <tfoot>
                          <tr className="border-t border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                            <td className="px-5 py-2.5" colSpan={3}>
                              <span className="inline-flex items-center gap-1.5"><Calculator size={14} /> Course total</span>
                            </td>
                            <td className="px-5 py-2.5 text-right">{totalEarned}<span className="font-normal text-slate-400">/{totalMax}</span></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
