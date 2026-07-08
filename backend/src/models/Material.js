const mongoose = require('mongoose');
const { Schema } = mongoose;

const materialSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  week: {
    type: String,
    required: [true, 'Week is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['pdf', 'pptx', 'docx', 'mp4', 'link'],
    required: [true, 'Type is required']
  },
  fileName: {
    type: String
  },
  size: {
    type: String
  },
  link: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Material', materialSchema);
