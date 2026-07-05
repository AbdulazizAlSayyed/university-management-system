import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, ShieldCheck, BookOpen, Users, ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button, FormField, Input } from '../../components/ui'

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const doLogin = async (email, password) => {
    setError('')
    setLoading(true)
    
    try {
      const user = await login(email, password);
      setLoading(false);
      toast(`Welcome back, ${user.firstName}!`, 'success');
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!identifier || !password) {
      setError('Please enter your email/username and password.')
      return
    }
    doLogin(identifier, password)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap size={26} />
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight">UniHub</p>
            <p className="text-xs text-white/70">University Management System</p>
          </div>
        </div>

        <div className="relative text-white">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Run your entire<br />campus from one place.
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            A unified portal for administrators, professors, and students — courses,
            enrollment, classrooms, grades, exams, and announcements.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: ShieldCheck, text: 'Role-based access & account activation' },
              { icon: BookOpen, text: 'Classrooms, materials, assignments & grading' },
              { icon: Users, text: 'Enrollment, transcripts & exam scheduling' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/90">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                  <f.icon size={16} />
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">© 2026 UniHub · Business Requirements v1.1</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
              <GraduationCap size={22} />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-800">UniHub</p>
              <p className="text-xs text-slate-400">University Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Sign in to your account</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to access the portal.</p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" autoComplete="off">
            <FormField label="Email or Username">
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="you@university.edu"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="new-email"
                />
              </div>
            </FormField>

            <FormField label="Password">
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  className="px-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={18} />}
            </Button>
          </form>

          {/* Navigation footer */}
          <p className="mt-5 text-center text-sm text-slate-600">
            New to UniHub?{' '}
            <Link to="/register/student" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              Join as Student
            </Link>
            {' '}or{' '}
            <Link to="/register/professor" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              Professor
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}