const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['grade', 'assignment', 'material', 'announcement', 'submission', 'system'],
    required: [true, 'Type is required']
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
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
