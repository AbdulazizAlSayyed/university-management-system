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
    select: false // Never return password by default in queries
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'professor', 'student']
  },
  isActive: {
    type: Boolean,
    default: false // Admin must activate new accounts
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
  timestamps: { createdAt: true, updatedAt: false },
  // Ensure virtual fields are included when converting documents to JSON or Objects
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to combine names seamlessly if a query needs a full string fallback
userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);