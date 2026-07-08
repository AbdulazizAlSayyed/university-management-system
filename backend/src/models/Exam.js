const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new Schema({
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
  date: {
    type: Date,
    required: [true, 'Exam date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  room: {
    type: String,
    required: [true, 'Room is required']
  },
  type: {
    type: String,
    enum: ['Midterm', 'Final', 'Quiz'],
    default: 'Midterm'
  }
});

module.exports = mongoose.model('Exam', examSchema);
