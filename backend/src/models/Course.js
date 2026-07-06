const mongoose = require('mongoose');
const { Schema } = mongoose;

const materialSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Material title is required']
  },
  weekTopic: {
    type: String,
    required: [true, 'Week or topic is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

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
  materials: [materialSchema]
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Course', courseSchema);
