const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
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
    select: false
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'professor', 'student']
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  // Student-only fields
  studentId: { type: String, trim: true },
  program: { type: String, trim: true },
  year: { type: Number },
  // Professor/Admin fields
  department: { type: String, trim: true },
  title: { type: String, trim: true },
  // Display
  avatarColor: { type: String, default: 'bg-brand-600' },
  username: { type: String, trim: true },
  isActive: {
    type: Boolean,
    default: false
  },
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  assignedCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
