import mongoose from 'mongoose'
const { Schema } = mongoose

const examSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Quiz', 'Midterm', 'Final'], default: 'Midterm' },
    date: { type: Date, required: true },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '11:00' },
    room: { type: String, default: '' },
  },
<<<<<<< HEAD
  examDate: {
    type: Date,
    required: [true, 'Exam date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  room: {
    type: String,
    required: [true, 'Room is required']
  },
  title: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Midterm', 'Final', 'Quiz', 'Other'],
    default: 'Other'
  },
  createdByAdminId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});
=======
  { timestamps: true }
)
>>>>>>> Development

examSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) { delete ret._id; delete ret.__v; return ret },
})

export default mongoose.model('Exam', examSchema)
