const mongoose = require('mongoose');
const { Schema } = mongoose;

const assignmentSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  maxScore: {
    type: Number,
    default: 100
  },
  attachment: {
    type: String
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
