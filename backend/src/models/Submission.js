const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  submittedAt: {
    type: String,
    required: true,
    default: () => new Date().toISOString().slice(0, 10)
  },
  score: {
    type: Number
  },
  feedback: {
    type: String
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'missing'],
    default: 'submitted'
  }
});

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
