// Mahmoud (Team Lead) — Transcript: official academic record from API
import { useMemo } from 'react'
import { FileText, Download, GraduationCap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { studentApi } from '../../api'
import { useFetch } from '../../hooks/useFetch'
import { PageHeader, Card, Button, LoadingState } from '../../components/ui'
import { fullName, calculateGPA, gradeColor, classNames } from '../../utils/helpers'

export default function StudentTranscript() {
  const { currentUser } = useAuth()
  const { data, loading } = useFetch(() => studentApi.getTranscript())

  const courseById = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries((data.courses || []).map((c) => [c.id, c]))
  }, [data])

  const userById = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries((data.users || []).map((u) => [u.id, u]))
  }, [data])

  const myGrades = data?.grades || []
  const { gpa, credits } = calculateGPA(myGrades, courseById)

  const myCourseIds = new Set((data?.enrollments || []).filter((e) => e.studentId === currentUser.id).map((e) => e.courseId))

  const rows = [...myCourseIds].map((cid) => {
    const c = courseById[cid]
    const g = myGrades.find((x) => x.courseId === cid)
    return { course: c, grade: g }
  }).filter((r) => r.course)

  const totalCredits = rows.reduce((a, r) => a + (r.course.credits || 0), 0)

  if (loading) return <LoadingState label="Loading transcript…" />
  if (!data) return <Card className="p-6 text-center text-slate-500">Could not load transcript.</Card>

  return (
    <div>
      <PageHeader
        title="Academic Transcript"
        subtitle="Your official academic record. Download or print as PDF."
        icon={FileText}
        actions={<Button icon={Download} onClick={() => window.print()}>Download PDF</Button>}
      />

      <Card id="transcript" className="mx-auto max-w-3xl p-8 sm:p-10">
        <div className="flex items-center justify-between border-b-2 border-brand-600 pb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white">
              <GraduationCap size={26} />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-800">UniHub University</p>
              <p className="text-xs text-slate-500">Office of the Registrar · Official Transcript</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Current Semester</p>
            <p>Issued {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student</p>
            <p className="font-semibold text-slate-800">{fullName(currentUser)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student ID</p>
            <p className="font-semibold text-slate-800">{currentUser.studentId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Program</p>
            <p className="font-semibold text-slate-800">{currentUser.program}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Year</p>
            <p className="font-semibold text-slate-800">Year {currentUser.year}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-y border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5">Code</th>
              <th className="py-2.5">Course Title</th>
              <th className="py-2.5">Professor</th>
              <th className="py-2.5 text-center">Credits</th>
              <th className="py-2.5 text-center">Grade</th>
              <th className="py-2.5 text-center">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ course, grade }) => (
              <tr key={course.id}>
                <td className="py-2.5 font-medium text-slate-700">{course.code}</td>
                <td className="py-2.5 text-slate-700">{course.name}</td>
                <td className="py-2.5 text-slate-500">{userById[course.professorId] ? fullName(userById[course.professorId]) : 'TBA'}</td>
                <td className="py-2.5 text-center text-slate-600">{course.credits}</td>
                <td className={classNames('py-2.5 text-center font-bold', grade?.letter ? gradeColor(grade.letter) : 'text-slate-400')}>
                  {grade?.status === 'final' ? grade.letter : 'IP'}
                </td>
                <td className="py-2.5 text-center text-slate-600">{grade?.status === 'final' ? grade.points.toFixed(1) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Credits</p>
              <p className="text-lg font-bold text-slate-800">{totalCredits}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</p>
              <p className="text-lg font-bold text-slate-800">{credits}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cumulative GPA</p>
            <p className="text-3xl font-extrabold text-brand-600">{gpa.toFixed(2)}</p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          IP = In Progress. This is a system-generated document for demonstration purposes.<br />
          UniHub University · Office of the Registrar · Not valid without official seal.
        </p>
      </Card>
    </div>
  )
}
