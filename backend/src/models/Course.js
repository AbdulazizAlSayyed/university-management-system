const mongoose = require('mongoose');
const { Schema } = mongoose;

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
  name: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    default: 3,
    min: 0
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
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform(doc, ret) {
      if (!ret.name) ret.name = ret.title;
      if (!ret.title) ret.title = ret.name;
      return ret;
    }
  },
  toObject: {
    transform(doc, ret) {
      if (!ret.name) ret.name = ret.title;
      if (!ret.title) ret.title = ret.name;
      return ret;
    }
  }
});

module.exports = mongoose.model('Course', courseSchema);
