const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false // never return password by default in queries
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'professor', 'student']
  },
  isActive: {
    type: Boolean,
    default: false // admin must activate new accounts
  },
  // Student-only fields
  gpa: {
    type: Number,
    min: 0,
    max: 4
  },
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  // Professor-only field
  assignedCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('User', userSchema);
