import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

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
