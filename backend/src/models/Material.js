const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    index: true
  },
  week: {
    type: String,
    default: 'Week 1'
  },
  title: {
    type: String,
    required: [true, 'Material title is required']
  },
  type: {
    type: String,
    enum: ['pdf', 'pptx', 'docx', 'mp4', 'link', 'file'],
    default: 'file'
  },
  fileName: {
    type: String
  },
  fileUrl: {
    type: String
  },
  link: {
    type: String
  },
  size: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
