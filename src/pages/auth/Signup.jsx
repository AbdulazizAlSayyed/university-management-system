import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      localStorage.setItem('token', res.data.token);
      window.location.href = `/${formData.role}/dashboard`;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="flex justify-center items-center min-height-screen min-h-screen bg-slate-50 font-sans p-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 w-full max-w-[480px] box-sizing-border-box">
        
        <h2 className="text-center text-3xl font-bold text-slate-900 mb-2">Create your Account</h2>
        <p className="text-center text-slate-500 text-sm mb-8">Join UniHub University Management Suite</p>

        {error && (
          <div className="bg-red-50 border border-red-200 color text-red-600 p-3 rounded-lg text-sm mb-5 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          
          {/* 💡 Using Tailwind's clean grid matching configuration to fix the alignment */}
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
            <label className="field-label">Email Address</label>
            {/* 💡 added autoComplete configurations to drop browser autofill background defaults */}
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@university.edu" autoComplete="new-email" className="field-input" required />
          </div>

          <div className="mb-6">
            <label className="field-label">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="field-input" required />
          </div>

          <div className="mb-8">
            <label className="field-label">I am registering as a:</label>
            <select name="role" value={formData.role} onChange={handleChange} className="field-input cursor-pointer">
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;