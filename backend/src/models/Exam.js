const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
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
  createdByAdminId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Exam', examSchema);
