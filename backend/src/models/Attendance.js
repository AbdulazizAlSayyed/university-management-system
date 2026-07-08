const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceRecordSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  present: {
    type: Boolean,
    required: true
  }
}, { _id: false });

const attendanceSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  date: {
    type: Date,
    required: [true, 'Session date is required']
  },
  topic: {
    type: String,
    trim: true
  },
  records: [attendanceRecordSchema]
});

attendanceSchema.index({ courseId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
