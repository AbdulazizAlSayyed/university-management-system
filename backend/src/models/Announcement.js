const mongoose = require('mongoose');
const { Schema } = mongoose;

const announcementSchema = new Schema({
  scope: {
    type: String,
    enum: ['system', 'course'],
    required: [true, 'Scope is required']
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Body is required'],
    trim: true
  },
  pinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

module.exports = mongoose.model('Announcement', announcementSchema);
