const mongoose = require('mongoose');
const { Schema } = mongoose;

// Base schema — fields every role shares. No course arrays here on purpose:
// admins have none, students only get enrolledCourses, professors only get
// assignedCourses. Those are added below via discriminators, not here.
const baseOptions = {
  timestamps: { createdAt: true, updatedAt: true }, // Changed updatedAt to true for professional tracking
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
};

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

  // The email the person submitted their request with (or the admin already knew).
  // Used to send them their university credentials. Permanent contact address.
  personalEmail: {
    type: String,
    trim: true,
    lowercase: true
  },

  // The university login email. Empty until the admin provisions the account.
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true // allows many docs with no email yet, without unique-index collisions
  },

  // Not required at schema level: 'requested' accounts have no password yet.
  password: {
    type: String,
    select: false
  },

  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'professor', 'student']
  },

  // requested -> account exists only as a request, no credentials yet
  // active    -> admin has created university email/password and emailed them
  // inactive  -> admin has disabled a previously active account
  status: {
    type: String,
    enum: ['requested', 'active', 'inactive'],
    default: 'requested'
  },

  // Extra profile fields the admin panel collects (Shared fields only)
  username: { type: String, trim: true },
  phone: { type: String, trim: true },

  // Forgot-password support
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}, baseOptions);

userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

// STUDENT discriminator — only students have enrolledCourses, gpa, dateOfBirth, and year.
// Admin and professor documents will never have these fields at all.
const Student = User.discriminator('student', new Schema({
  studentId: { type: String, trim: true },
  dateOfBirth: Date,
  year: { type: Number },
  gpa: {
    type: Number,
    min: 0,
    max: 4
  },
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
}));

// PROFESSOR discriminator — only professors have assignedCourses and title.
const Professor = User.discriminator('professor', new Schema({
  title: { type: String, trim: true },
  assignedCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
}));

// Admin has no extra fields, so it just uses the base User model directly —
// no discriminator needed, which is exactly why admins get no course arrays.

// Picks the right model to instantiate/query based on role.
function getModelForRole(role) {
  if (role === 'student') return Student;
  if (role === 'professor') return Professor;
  return User; // admin
}

module.exports = User;
module.exports.Student = Student;
module.exports.Professor = Professor;
module.exports.getModelForRole = getModelForRole;