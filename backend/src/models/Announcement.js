const mongoose = require('mongoose');
const { Schema } = mongoose;

const announcementSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course' // omitted = system-wide announcement
  },
  postedByAdminId: {
    type: Schema.Types.ObjectId,
    ref: 'User' // set for system-wide announcements
  },
  postedByProfessorId: {
    type: Schema.Types.ObjectId,
    ref: 'User' // set for course-specific announcements
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Enforce "exactly one poster type" at the application layer,
// since Mongoose validators run per-field, not cross-field, by default.
announcementSchema.pre('validate', function (next) {
  const hasAdmin = !!this.postedByAdminId;
  const hasProfessor = !!this.postedByProfessorId;

  if (hasAdmin === hasProfessor) {
    // both set, or neither set — invalid either way
    return next(new Error('Announcement must be posted by exactly one of: admin or professor'));
  }
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);
