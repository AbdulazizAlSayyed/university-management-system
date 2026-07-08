const mongoose = require('mongoose');
const { Schema } = mongoose;

const gradeSchema = new Schema({
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
  score: {
    type: Number
  },
  letter: {
    type: String
  },
  points: {
    type: Number
  },
  status: {
    type: String,
    enum: ['in-progress', 'final'],
    default: 'in-progress'
  }
});

gradeSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
