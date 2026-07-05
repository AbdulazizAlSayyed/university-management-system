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
  fileUrl: {
    type: String,
    required: [true, 'Submission file is required']
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  grade: {
    type: String // set once graded by professor
  },
  feedback: {
    type: String
  }
});

// A student can only submit once per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
