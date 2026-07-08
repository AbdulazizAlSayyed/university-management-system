const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    required: [true, 'Credits is required'],
    min: 1,
    default: 3
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  professorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned professor is required']
  },
  semester: {
    type: String,
    trim: true,
    default: 'Fall 2026'
  },
  schedule: {
    type: String,
    trim: true
  },
  room: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: 'bg-brand-500'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Course', courseSchema);
