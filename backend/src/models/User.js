import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

<<<<<<< HEAD
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

  dateOfBirth: Date,

  // Extra profile fields the admin panel collects
  username: { type: String, trim: true },
  phone: { type: String, trim: true },
  department: { type: String, trim: true, default: 'Computer Science' },
  title: { type: String, trim: true },
  studentId: { type: String, trim: true },
  program: { type: String, trim: true, default: 'Computer Science' },
  year: { type: Number },

  // Student-only
  gpa: {
    type: Number,
    min: 0,
    max: 4
  },
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],

  // Professor-only
  assignedCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],

  // Forgot-password support
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
=======
const { Schema } = mongoose

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'professor', 'student'], default: 'student' },
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active' },
    username: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatarColor: { type: String, default: 'bg-brand-600' },
    // student fields
    studentId: { type: String, trim: true },
    program: { type: String, trim: true },
    year: { type: Number },
    // professor fields
    department: { type: String, trim: true },
    title: { type: String, trim: true },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

userSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret.password
    delete ret.__v
    return ret
  },
})

export default mongoose.model('User', userSchema)
>>>>>>> Development
