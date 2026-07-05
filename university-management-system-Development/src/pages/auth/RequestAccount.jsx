import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import axios from 'axios'

// Rendered at /register/student and /register/professor.
// The role comes from the URL, so there's no role picker on the page itself.
const ROLE_LABELS = {
  student: 'Student',
  professor: 'Professor'
}

export default function RequestAccount() {
  const { role } = useParams()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalEmail: '',
    dateOfBirth: '',
    title: '',
    year: ''
  })

  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!ROLE_LABELS[role]) {
    return <Navigate to="/login" replace />
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1. Create a copy of the form data including the role
    const payload = { ...formData, role }

    // 2. Strip unnecessary fields depending on the user role
    if (role === 'professor') {
      delete payload.dateOfBirth
      delete payload.year
    } else if (role === 'student') {
      delete payload.title
    }

    try {
      // 3. Send the cleaned payload instead of ...formData
      await axios.post('http://localhost:5000/api/auth/request-account', payload)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong submitting your request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 font-sans p-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 w-full max-w-[480px]">
        <h2 className="text-center text-3xl font-bold text-slate-900 mb-2">
          Register as a {ROLE_LABELS[role]}
        </h2>
        <p className="text-center text-slate-500 text-sm mb-8">
          Submit your details and an admin will email you your university login within 24 hours.
        </p>

        {submitted ? (
          <div className="text-center">
            <p className="text-slate-700 font-medium mb-4">Request submitted!</p>
            <p className="text-slate-500 text-sm mb-6">
              An admin will review your request and email your university email and password
              to <span className="font-semibold">{formData.personalEmail}</span> within 24 hours.
            </p>
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-5 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="field-label">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="field-input" required />
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="field-input" required />
                </div>
              </div>

              <div className="mb-5">
                <label className="field-label">Your Email Address</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="new-email"
                  className="field-input"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  We'll send your university login credentials here once approved.
                </p>
              </div>

              {role === 'student' && (
              <div className="mb-8">
                <label className="field-label">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="field-input" />
              </div>
              )}

              {role === 'professor' && (
                <div className="mb-8">
                  <label className="field-label">Title</label>
                  <select name="title" value={formData.title} onChange={handleChange} className="field-input" required>
                    <option value="">Select title</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
              )}

              {role === 'student' && (
                <div className="mb-8">
                  <label className="field-label">Year of Study</label>
                  <select name="year" value={formData.year} onChange={handleChange} className="field-input" required>
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit request'}
              </button>
            </form>

            <Link to="/login" className="mt-6 flex items-center justify-center text-sm font-semibold text-brand-600 hover:text-brand-700">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
