const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  enrollmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['enrolled', 'dropped', 'completed'],
    default: 'enrolled'
  },
  finalGrade: {
    type: String // e.g. "A", "B+", "92", "Pass" — set once graded
  }
});

// A student can only enroll in the same course once
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
