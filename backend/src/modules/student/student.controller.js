const { User, Course, Enrollment, Material, Assignment, Submission, Grade, Exam, Announcement, Notification } = require('../../models');
const { calculateGPA, calculateCourseGrade } = require('./student.service');
const asyncHandler = require('../../middleware/asyncHandler.middleware');
const path = require('path');
const fs = require('fs');


// Mahmoud — GET /api/student/dashboard — overview data for the dashboard page
exports.getDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const myEnrollments = await Enrollment.find({ studentId, status: 'enrolled' }).lean();
  const myCourseIds = myEnrollments.map((e) => e.courseId.toString());
  const myCourses = await Course.find({ _id: { $in: myCourseIds } }).lean();
  const allCourses = await Course.find().lean();
  const allUsers = await User.find().select('-password').lean();
  const allAssignments = await Assignment.find().lean();
  const allSubmissions = await Submission.find().lean();
  const myGrades = await Grade.find({ studentId }).lean();
  const allExams = await Exam.find().lean();
  const allAnnouncements = await Announcement.find().lean();
  const myNotifications = await Notification.find({ userId: studentId }).sort({ createdAt: -1 }).lean();

  const courseById = Object.fromEntries(allCourses.map((c) => [(c._id || c.id).toString(), c]));
  const userById = Object.fromEntries(allUsers.map((u) => [(u._id || u.id).toString(), u]));
  const { gpa } = calculateGPA(myGrades, courseById);

  const submittedAsgIds = new Set(
    allSubmissions.filter((s) => s.studentId.toString() === studentId).map((s) => s.assignmentId.toString())
  );
  const now = new Date('2026-10-06T12:00:00Z');
  const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - now) / 86400000);

  const pendingAssignments = allAssignments
    .filter((a) => myCourseIds.includes(a.courseId.toString()) && !submittedAsgIds.has(a._id ? a._id.toString() : a.id) && daysUntil(a.dueDate) >= 0)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const upcomingExams = allExams
    .filter((x) => myCourseIds.includes(x.courseId.toString()) && daysUntil(x.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const feed = allAnnouncements
    .filter((a) => a.scope === 'system' || (a.scope === 'course' && myCourseIds.includes(a.courseId.toString())))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  res.json({
    myCourses: myCourses.map(formatDoc),
    users: allUsers.map(formatUser),
    courseById,
    userById,
    enrollments: myEnrollments.map(formatDoc),
    pendingAssignments: pendingAssignments.map(formatDoc),
    upcomingExams: upcomingExams.map(formatDoc),
    announcements: feed.map(formatDoc),
    notifications: myNotifications.map(formatDoc),
    gpa,
    pendingCount: pendingAssignments.length,
    examCount: upcomingExams.length,
  });
});

// Mahmoud — GET /api/student/courses — all active courses (for catalog)
exports.getCatalog = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'active' }).lean();
  const users = await User.find().select('-password').lean();
  const enrollments = await Enrollment.find().lean();
  res.json({ courses: courses.map(formatDoc), users: users.map(formatUser), enrollments: enrollments.map(formatDoc) });
});

// Mahmoud — POST /api/student/enrollments — enroll in a course
exports.enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;
  const exists = await Enrollment.findOne({ studentId, courseId });
  if (exists) return res.status(400).json({ message: 'Already enrolled' });
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const count = await Enrollment.countDocuments({ courseId, status: 'enrolled' });
  if (count >= course.capacity) return res.status(400).json({ message: 'Course is full' });
  const enrollment = await Enrollment.create({ studentId, courseId });
  await Grade.create({ studentId, courseId, status: 'in-progress' });
  res.status(201).json(formatDoc(enrollment));
});

// Mahmoud — DELETE /api/student/enrollments/:courseId — drop a course
exports.drop = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.id;
  const enrollment = await Enrollment.findOneAndDelete({ studentId, courseId });
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
  await Grade.deleteOne({ studentId, courseId, status: 'in-progress' });
  res.json({ message: 'Dropped successfully' });
});

// Mahmoud — GET /api/student/enrollments/mine — my enrollments
exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user.id }).lean();
  res.json(enrollments.map(formatDoc));
});

// Mahmoud — GET /api/student/my-courses — my enrolled courses with details
exports.getMyCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user.id, status: 'enrolled' }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const myCourses = await Course.find({ _id: { $in: courseIds } }).lean();
  const users = await User.find().select('-password').lean();
  const allEnrollments = await Enrollment.find().lean();
  res.json({
    courses: myCourses.map(formatDoc),
    users: users.map(formatUser),
    enrollments: allEnrollments.map(formatDoc),
    myCourseIds: courseIds,
  });
});

// Mahmoud — GET /api/student/courses/:courseId — classroom (course + materials + announcements + assignments)
exports.getClassroom = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.id;
  const enrollment = await Enrollment.findOne({ studentId, courseId, status: 'enrolled' });
  if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
  const course = await Course.findById(courseId).lean();
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const professor = await User.findById(course.professorId).select('-password').lean();
  const materials = await Material.find({ courseId }).sort({ createdAt: -1 }).lean();
  const announcements = await Announcement.find({ scope: 'course', courseId }).sort({ createdAt: -1 }).lean();
  const assignments = await Assignment.find({ courseId }).lean();
  const submissions = await Submission.find({ studentId }).lean();
  res.json({
    course: formatDoc(course),
    professor: professor ? formatUser(professor) : null,
    materials: materials.map(formatDoc),
    announcements: announcements.map(formatDoc),
    assignments: assignments.map(formatDoc),
    submissions: submissions.map(formatDoc),
  });
});

// Mahmoud — GET /api/student/assignments — all assignments for my courses
exports.getAssignments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user.id, status: 'enrolled' }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const assignments = await Assignment.find({ courseId: { $in: courseIds } }).lean();
  const courses = await Course.find().lean();
  const submissions = await Submission.find({ studentId: req.user.id }).lean();
  res.json({
    assignments: assignments.map(formatDoc),
    courses: courses.map(formatDoc),
    submissions: submissions.map(formatDoc),
  });
});

// Mahmoud — POST /api/student/submissions — submit an assignment
exports.submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, fileName } = req.body;
  const studentId = req.user.id;
  const existing = await Submission.findOne({ assignmentId, studentId });
  if (existing) {
    const updated = await Submission.findByIdAndUpdate(
      existing._id,
      { fileName, submittedAt: new Date().toISOString().slice(0, 10), status: 'submitted', score: null, feedback: null },
      { new: true }
    );
    return res.json(formatDoc(updated));
  }
  const submission = await Submission.create({ assignmentId, studentId, fileName });
  // Notify student of submission
  const asg = await Assignment.findById(assignmentId).lean();
  if (asg) {
    await createNotification({
      userId: studentId,
      type: 'submission',
      title: 'Assignment submitted',
      body: `Your submission for "${asg.title}" has been received.`,
      link: '/student/assignments',
    });
  }
  res.status(201).json(formatDoc(submission));
});

// Mahmoud — GET /api/student/submissions/mine
exports.getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ studentId: req.user.id }).lean();
  res.json(submissions.map(formatDoc));
});

// Mahmoud — GET /api/student/grades — my grades + GPA (auto-calculated from submissions)
exports.getGrades = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const enrollments = await Enrollment.find({ studentId, status: 'enrolled' }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const myCourses = await Course.find({ _id: { $in: courseIds } }).lean();
  let myGrades = await Grade.find({ studentId }).lean();
  const allCourses = await Course.find().lean();
  const courseById = Object.fromEntries(allCourses.map((c) => [c.id || c._id, c]));
  const assignments = await Assignment.find({ courseId: { $in: courseIds } }).lean();
  const submissions = await Submission.find({ studentId }).lean();

  // Auto-calculate grades from submissions — only mark final when ALL assignments graded
  for (const course of myCourses) {
    const existing = myGrades.find((g) => g.courseId.toString() === (course._id || course.id).toString());
    if (existing && existing.status === 'final') continue;
    const courseAsgs = assignments.filter((a) => a.courseId.toString() === (course._id || course.id).toString());
    const courseSubs = submissions.filter((s) => courseAsgs.some((a) => (a._id || a.id).toString() === (s.assignmentId || s._id).toString()));
    const calc = calculateCourseGrade(courseSubs, courseAsgs);
    if (calc) {
      const update = { score: calc.score, letter: calc.letter, points: calc.points, status: calc.status };
      if (existing) {
        await Grade.findByIdAndUpdate(existing._id, update);
        Object.assign(existing, calc);
      } else {
        const created = await Grade.create({ studentId, courseId: course._id || course.id, ...update });
        myGrades.push(formatDoc(created.toObject ? created.toObject() : created));
      }
      // Only notify when grade becomes final
      if (calc.status === 'final') {
        await createNotification({
          userId: studentId, type: 'grade',
          title: 'Grade posted',
          body: `Your final grade for ${course.code} — ${course.name}: ${calc.letter} (${calc.score}%).`,
          link: '/student/grades',
        });
      }
    }
  }

  // Re-fetch to be safe
  myGrades = await Grade.find({ studentId }).lean();
  const { gpa, credits } = calculateGPA(myGrades, courseById);
  res.json({
    courses: myCourses.map(formatDoc),
    grades: myGrades.map(formatDoc),
    assignments: assignments.map(formatDoc),
    submissions: submissions.map(formatDoc),
    gpa, credits,
  });
});

// Mahmoud — POST /api/student/courses/:courseId/calculate-grade — manually trigger grade calculation
exports.calculateGrade = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;
  const enrollment = await Enrollment.findOne({ studentId, courseId, status: 'enrolled' });
  if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });
  const assignments = await Assignment.find({ courseId }).lean();
  const submissions = await Submission.find({ studentId, assignmentId: { $in: assignments.map((a) => a._id || a.id) } }).lean();
  const calc = calculateCourseGrade(submissions, assignments);
  if (!calc) return res.status(400).json({ message: 'No graded submissions to calculate from', grade: null });
  const existing = await Grade.findOne({ studentId, courseId });
  const update = { score: calc.score, letter: calc.letter, points: calc.points, status: calc.status };
  if (existing) {
    await Grade.findByIdAndUpdate(existing._id, update);
  } else {
    await Grade.create({ studentId, courseId, ...update });
  }
  // Only notify when grade becomes final
  if (calc.status === 'final') {
    const course = await Course.findById(courseId).lean();
    if (course) {
      await createNotification({
        userId: studentId, type: 'grade',
        title: 'Grade posted',
        body: `Your final grade for ${course.code} — ${course.name}: ${calc.letter} (${calc.score}%).`,
        link: '/student/grades',
      });
    }
  }
  res.json({ message: calc.status === 'final' ? 'Grade finalized' : 'Grade preview calculated', grade: calc });
});

// Mahmoud — GET /api/student/transcript
exports.getTranscript = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const enrollments = await Enrollment.find({ studentId, status: { $in: ['enrolled', 'completed'] } }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const users = await User.find().select('-password').lean();
  const myGrades = await Grade.find({ studentId }).lean();
  const courseById = Object.fromEntries(courses.map((c) => [c.id || c._id, c]));
  const { gpa, credits } = calculateGPA(myGrades, courseById);
  res.json({
    courses: courses.map(formatDoc),
    users: users.map(formatUser),
    enrollments: enrollments.map(formatDoc),
    grades: myGrades.map(formatDoc),
    gpa, credits,
  });
});

// Mahmoud — GET /api/student/exams
exports.getExams = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user.id, status: 'enrolled' }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const exams = await Exam.find({ courseId: { $in: courseIds } }).sort({ date: 1 }).lean();
  const courses = await Course.find().lean();
  res.json({ exams: exams.map(formatDoc), courses: courses.map(formatDoc) });
});

// Mahmoud — GET /api/student/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(notifications.map(formatDoc));
});

// Mahmoud — PATCH /api/student/notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
});

// Mahmoud — PATCH /api/student/notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(formatDoc(notification));
});

// Mahmoud — GET /api/student/materials/:id/download — serve/download a material file
exports.downloadMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).lean();
  if (!material) return res.status(404).json({ message: 'Material not found' });
  if (material.type === 'link') return res.redirect(material.link);
  const filePath = path.join(__dirname, '..', '..', '..', 'uploads', material.fileName);
  if (fs.existsSync(filePath)) return res.download(filePath);
  res.status(404).json({ message: 'File not found on server' });
});

// Mahmoud — GET /api/student/users — all users (for professor names etc.)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();
  res.json(users.map(formatUser));
});

// Mahmoud — GET /api/student/all-courses — all courses (for courseById map)
exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().lean();
  res.json(courses.map(formatDoc));
});

// --- Notification helper ---
async function createNotification({ userId, type, title, body, link }) {
  try {
    await Notification.create({ userId, type, title, body, link, read: false });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

// --- Helpers ---
function formatDoc(doc) {
  if (!doc) return doc;
  return { ...doc, id: doc._id ? doc._id.toString() : doc.id };
}

function formatUser(user) {
  if (!user) return user;
  return {
    ...user,
    id: user._id ? user._id.toString() : user.id,
    username: user.username || `${user.firstName} ${user.lastName}`,
    name: user.name || `${user.firstName} ${user.lastName}`,
  };
}