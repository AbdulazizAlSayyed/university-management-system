import mongoose from 'mongoose'
const { Schema } = mongoose

<<<<<<< HEAD
const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  semester: {
    type: String,
    trim: true
  },
  professorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned professor is required']
  },
  name: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    default: 3,
    min: 0
  },
  schedule: {
    type: String,
    trim: true
  },
  room: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: 'bg-brand-500'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform(doc, ret) {
      if (!ret.name) ret.name = ret.title;
      if (!ret.title) ret.title = ret.name;
      return ret;
    }
  },
  toObject: {
    transform(doc, ret) {
      if (!ret.name) ret.name = ret.title;
      if (!ret.title) ret.title = ret.name;
      return ret;
    }
  }
});
=======
const courseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    credits: { type: Number, default: 3, min: 1, max: 6 },
    capacity: { type: Number, default: 30, min: 1 },
    professorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    semester: { type: String, default: 'Fall 2026' },
    schedule: { type: String, default: '' },
    room: { type: String, default: '' },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Course', default: [] }],
    color: { type: String, default: 'bg-brand-500' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
)

courseSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) { delete ret._id; delete ret.__v; return ret },
})
>>>>>>> Development

export default mongoose.model('Course', courseSchema)
