const {
  User, Course, Enrollment, Assignment, Submission,
  Grade, Exam, Announcement, Notification, Attendance, Material
} = require('../../models');
const { sendNotificationEmail } = require('../../utils/mailer');

const GRADE_SCALE = [
  { letter: 'A', min: 93, points: 4.0 },
  { letter: 'A-', min: 90, points: 3.7 },
  { letter: 'B+', min: 87, points: 3.3 },
  { letter: 'B', min: 83, points: 3.0 },
  { letter: 'B-', min: 80, points: 2.7 },
  { letter: 'C+', min: 77, points: 2.3 },
  { letter: 'C', min: 73, points: 2.0 },
  { letter: 'C-', min: 70, points: 1.7 },
  { letter: 'D', min: 60, points: 1.0 },
  { letter: 'F', min: 0, points: 0.0 },
];

function scoreToLetter(score) {
  if (score == null) return null;
  const row = GRADE_SCALE.find((g) => score >= g.min);
  return row ? row.letter : 'F';
}

function scoreToPoints(score) {
  if (score == null) return null;
  const row = GRADE_SCALE.find((g) => score >= g.min);
  return row ? row.points : 0;
}

function getMyCourseIds(userId, enrollments) {
  return enrollments
    .filter((e) => e.studentId.toString() === userId.toString() && e.status === 'enrolled')
    .map((e) => e.courseId.toString());
}

// ---- Dashboard ----
async function getDashboard(userId) {
  const enrollments = await Enrollment.find({ studentId: userId, status: 'enrolled' });
  const myCourseIds = enrollments.map((e) => e.courseId);

  const myCourses = await Course.find({ _id: { $in: myCourseIds } });
  const myGrades = await Grade.find({ studentId: userId });

  const allAssignments = await Assignment.find({ courseId: { $in: myCourseIds } });
  const mySubmissions = await Submission.find({ studentId: userId });
  const submittedIds = mySubmissions.map((s) => s.assignmentId.toString());
  const now = new Date();

  const pendingAssignments = allAssignments
    .filter((a) => !submittedIds.includes(a._id.toString()) && new Date(a.deadline) >= now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const allExams = await Exam.find({ courseId: { $in: myCourseIds } });
  const upcomingExams = allExams
    .filter((x) => new Date(x.examDate) >= now)
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  const announcements = await Announcement.find({
    $or: [
      { courseId: { $in: myCourseIds } },
      { courseId: null, postedByAdminId: { $ne: null } }
    ]
  }).sort({ createdAt: -1 }).limit(4);

  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(4);

  const courseById = {};
  myCourses.forEach((c) => { courseById[c._id.toString()] = c; });

  let gpa = 0, totalCredits = 0, totalPoints = 0;
  myGrades.forEach((g) => {
    if (g.status === 'final' && g.points != null) {
      const course = courseById[g.courseId.toString()];
      const credits = course ? course.credits : 0;
      totalPoints += g.points * credits;
      totalCredits += credits;
    }
  });
  if (totalCredits > 0) gpa = +(totalPoints / totalCredits).toFixed(2);

  return {
    enrolledCoursesCount: myCourses.length,
    totalCredits: myCourses.reduce((a, c) => a + c.credits, 0),
    gpa,
    pendingAssignments: pendingAssignments.length,
    upcomingExamsCount: upcomingExams.length,
    myCourses,
    pendingAssignmentsList: pendingAssignments.slice(0, 5),
    upcomingExams: upcomingExams.slice(0, 5),
    announcements,
    notifications,
  };
}

// ---- Catalog ----
async function getCatalog() {
  const courses = await Course.find().populate('professorId', 'firstName lastName');
  const enrollments = await Enrollment.find({ status: 'enrolled' });
  const countMap = {};
  enrollments.forEach((e) => {
    const key = e.courseId.toString();
    countMap[key] = (countMap[key] || 0) + 1;
  });
  return courses.map((c) => {
    const obj = c.toObject({ virtuals: true });
    return {
      ...obj,
      name: obj.name || obj.title,
      id: c._id.toString(),
      professorName: c.professorId ? `${c.professorId.firstName} ${c.professorId.lastName}` : 'TBA',
      professorId: c.professorId?._id?.toString() || c.professorId?.toString(),
      enrolledCount: countMap[c._id.toString()] || 0,
    };
  });
}

// ---- Enroll ----
async function enroll(userId, courseId) {
  const course = await Course.findById(courseId);
  if (!course) throw { status: 404, message: 'Course not found' };

  const enrolled = await Enrollment.countDocuments({ courseId, status: 'enrolled' });
  if (enrolled >= course.capacity) throw { status: 400, message: 'Course is full' };

  const existing = await Enrollment.findOne({ studentId: userId, courseId });
  if (existing) {
    if (existing.status === 'dropped') {
      existing.status = 'enrolled';
      await existing.save();
      return existing;
    }
    throw { status: 400, message: 'Already enrolled' };
  }

  const enrollment = await Enrollment.create({ studentId: userId, courseId, status: 'enrolled' });
  await Grade.create({ studentId: userId, courseId, status: 'in-progress' });
  return enrollment;
}

// ---- Drop ----
async function drop(userId, courseId) {
  const enrollment = await Enrollment.findOne({ studentId: userId, courseId, status: 'enrolled' });
  if (!enrollment) throw { status: 404, message: 'Enrollment not found' };

  enrollment.status = 'dropped';
  await enrollment.save();
  await Grade.deleteOne({ studentId: userId, courseId, status: 'in-progress' });
  return enrollment;
}

// ---- My Courses ----
async function getMyCourses(userId) {
  const enrollments = await Enrollment.find({ studentId: userId, status: 'enrolled' });
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).populate('professorId', 'firstName lastName');
  const allEnrollments = await Enrollment.find({ courseId: { $in: courseIds }, status: 'enrolled' });
  const countMap = {};
  allEnrollments.forEach((e) => {
    const key = e.courseId.toString();
    countMap[key] = (countMap[key] || 0) + 1;
  });

  return courses.map((c) => {
    const obj = c.toObject({ virtuals: true });
    return {
      ...obj,
      name: obj.name || obj.title,
      id: c._id.toString(),
      professorName: c.professorId ? `${c.professorId.firstName} ${c.professorId.lastName}` : 'TBA',
      professorId: c.professorId?._id?.toString() || c.professorId?.toString(),
      enrolledCount: countMap[c._id.toString()] || 0,
    };
  });
}

// ---- Classroom ----
async function getClassroom(userId, courseId) {
  const enrollment = await Enrollment.findOne({ studentId: userId, courseId, status: 'enrolled' });
  if (!enrollment) throw { status: 403, message: 'Not enrolled in this course' };

  const course = await Course.findById(courseId).populate('professorId', 'firstName lastName email');
  if (!course) throw { status: 404, message: 'Course not found' };

  const materials = await Material.find({ courseId });
  const announcements = await Announcement.find({ courseId }).sort({ createdAt: -1 });
  const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });
  const submissions = await Submission.find({ studentId: userId, assignmentId: { $in: assignments.map((a) => a._id) } });

  const subMap = {};
  submissions.forEach((s) => {
    subMap[s.assignmentId.toString()] = {
      id: s._id.toString(),
      assignmentId: s.assignmentId.toString(),
      studentId: s.studentId.toString(),
      submittedAt: s.submittedAt,
      fileName: s.fileUrl,
      status: s.grade != null ? 'graded' : 'submitted',
      score: s.grade ? Number(s.grade) : null,
      feedback: s.feedback,
    };
  });

  return {
    course: { ...course.toObject({ virtuals: true }), id: course._id.toString(), professor: course.professorId, name: course.name || course.title },
    materials,
    announcements: announcements.map((a) => ({ ...a.toObject(), id: a._id.toString() })),
    assignments: assignments.map((a) => ({
      ...a.toObject(), id: a._id.toString(),
      dueDate: a.deadline,
      maxScore: 100,
      sub: subMap[a._id.toString()] || null,
    })),
  };
}

// ---- Assignments ----
async function getAssignments(userId) {
  const enrollments = await Enrollment.find({ studentId: userId, status: 'enrolled' });
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } });
  const courseMap = {};
  courses.forEach((c) => { courseMap[c._id.toString()] = { code: c.code, name: c.name }; });

  const assignments = await Assignment.find({ courseId: { $in: courseIds } }).sort({ deadline: 1 });
  const submissions = await Submission.find({ studentId: userId });

  const subMap = {};
  submissions.forEach((s) => {
    subMap[s.assignmentId.toString()] = {
      id: s._id.toString(),
      assignmentId: s.assignmentId.toString(),
      submittedAt: s.submittedAt,
      fileName: s.fileUrl,
      status: s.grade != null ? 'graded' : 'submitted',
      score: s.grade ? Number(s.grade) : null,
      feedback: s.feedback,
    };
  });

  return assignments.map((a) => ({
    ...a.toObject(),
    id: a._id.toString(),
    dueDate: a.deadline,
    maxScore: 100,
    courseCode: courseMap[a.courseId.toString()]?.code,
    courseName: courseMap[a.courseId.toString()]?.name,
    sub: subMap[a._id.toString()] || null,
  }));
}

// ---- Submit Assignment ----
async function submitAssignment(userId, assignmentId, fileName) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw { status: 404, message: 'Assignment not found' };

  const enrollment = await Enrollment.findOne({ studentId: userId, courseId: assignment.courseId, status: 'enrolled' });
  if (!enrollment) throw { status: 403, message: 'Not enrolled in this course' };

  const user = await User.findById(userId).select('firstName lastName');
  const course = await Course.findById(assignment.courseId).select('code title professorId name');

  const existing = await Submission.findOne({ assignmentId, studentId: userId });
  if (existing) {
    existing.fileUrl = fileName;
    existing.grade = undefined;
    existing.feedback = undefined;
    existing.submittedAt = new Date();
    await existing.save();

    const resubNotif = await Notification.create({
      userId: course.professorId,
      type: 'submission',
      title: 'Assignment resubmitted',
      body: `${user.firstName} ${user.lastName} resubmitted "${assignment.title}" in ${course.code}.`,
      link: '/professor/grading',
    });

    const professor = await User.findById(course.professorId).select('personalEmail email');
    if (professor) {
      sendNotificationEmail({
        to: professor.personalEmail || professor.email,
        subject: resubNotif.title,
        body: resubNotif.body,
        link: resubNotif.link,
      });
    }

    return existing;
  }

  const submission = await Submission.create({ assignmentId, studentId: userId, fileUrl: fileName });

  const newSubNotif = await Notification.create({
    userId: course.professorId,
    type: 'submission',
    title: 'New assignment submission',
    body: `${user.firstName} ${user.lastName} submitted "${assignment.title}" in ${course.code}.`,
    link: '/professor/grading',
  });

  const professor = await User.findById(course.professorId).select('personalEmail email');
  if (professor) {
    sendNotificationEmail({
      to: professor.personalEmail || professor.email,
      subject: newSubNotif.title,
      body: newSubNotif.body,
      link: newSubNotif.link,
    });
  }

  return submission;
}

// ---- Grades ----
async function getGrades(userId) {
  const enrollments = await Enrollment.find({ studentId: userId, status: 'enrolled' });
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } });
  const courseMap = {};
  courses.forEach((c) => { courseMap[c._id.toString()] = c; });

  const grades = await Grade.find({ studentId: userId });
  const assignments = await Assignment.find({ courseId: { $in: courseIds } });
  const submissions = await Submission.find({ studentId: userId });

  const subByAsg = {};
  submissions.forEach((s) => {
    subByAsg[s.assignmentId.toString()] = {
      id: s._id.toString(),
      assignmentId: s.assignmentId.toString(),
      status: s.grade != null ? 'graded' : 'submitted',
      score: s.grade ? Number(s.grade) : null,
      feedback: s.feedback,
    };
  });

  let gpa = 0, totalCredits = 0, totalPoints = 0;
  grades.forEach((g) => {
    if (g.status === 'final' && g.points != null) {
      const c = courseMap[g.courseId.toString()];
      const credits = c ? c.credits : 0;
      totalPoints += g.points * credits;
      totalCredits += credits;
    }
  });
  if (totalCredits > 0) gpa = +(totalPoints / totalCredits).toFixed(2);
  const finalized = grades.filter((g) => g.status === 'final').length;

  const courseGrades = courses.map((c) => {
    const g = grades.find((gr) => gr.courseId.toString() === c._id.toString());
    const courseAsgs = assignments
      .filter((a) => a.courseId.toString() === c._id.toString())
      .map((a) => ({
        id: a._id.toString(),
        title: a.title,
        dueDate: a.deadline,
        maxScore: 100,
        sub: subByAsg[a._id.toString()] || null,
      }));
    return {
      course: { ...c.toObject(), id: c._id.toString() },
      grade: g ? { ...g.toObject(), id: g._id.toString() } : null,
      assignments: courseAsgs,
    };
  });

  const gradesList = grades.map((g) => ({ ...g.toObject(), id: g._id.toString(), courseId: g.courseId.toString(), studentId: g.studentId.toString() }));
  return { gpa, credits: totalCredits, finalized, courseGrades, grades: gradesList };
}

// ---- Calculate Grade ----
async function calculateGrade(userId, courseId) {
  const submissions = await Submission.find({ studentId: userId }).populate('assignmentId');
  const courseSubs = submissions.filter(
    (s) => s.assignmentId && s.assignmentId.courseId.toString() === courseId.toString()
  );
  const graded = courseSubs.filter((s) => s.grade != null);
  if (graded.length === 0) return { score: null, letter: null, points: null };

  const totalScore = graded.reduce((sum, s) => sum + Number(s.grade), 0);
  const avgScore = Math.round(totalScore / graded.length);

  const letter = scoreToLetter(avgScore);
  const points = scoreToPoints(avgScore);

  let grade = await Grade.findOne({ studentId: userId, courseId });
  if (!grade) {
    grade = await Grade.create({ studentId: userId, courseId, score: avgScore, letter, points, status: 'in-progress' });
  } else {
    grade.score = avgScore;
    grade.letter = letter;
    grade.points = points;
    await grade.save();
  }

  return { score: avgScore, letter, points };
}

// ---- Transcript ----
async function getTranscript(userId) {
  const enrollments = await Enrollment.find({ studentId: userId });
  const allCourseIds = enrollments.map((e) => e.courseId.toString());
  const courses = await Course.find({ _id: { $in: allCourseIds } }).populate('professorId', 'firstName lastName');
  const courseMap = {};
  courses.forEach((c) => { courseMap[c._id.toString()] = c; });

  const grades = await Grade.find({ studentId: userId });
  const gradeMap = {};
  grades.forEach((g) => { gradeMap[g.courseId.toString()] = g; });

  let gpa = 0, totalCredits = 0, totalPoints = 0;
  grades.forEach((g) => {
    if (g.status === 'final' && g.points != null) {
      const c = courseMap[g.courseId.toString()];
      const credits = c ? c.credits : 0;
      totalPoints += g.points * credits;
      totalCredits += credits;
    }
  });
  if (totalCredits > 0) gpa = +(totalPoints / totalCredits).toFixed(2);

  const rows = allCourseIds.map((cid) => {
    const c = courseMap[cid];
    const g = gradeMap[cid];
    return {
      course: c ? { ...c.toObject(), id: c._id.toString(), professorName: c.professorId ? `${c.professorId.firstName} ${c.professorId.lastName}` : 'TBA' } : null,
      grade: g ? { letter: g.letter, points: g.points, status: g.status } : null,
    };
  }).filter((r) => r.course);

  return { rows, gpa, totalCredits, completedCredits: totalCredits };
}

// ---- Exams ----
async function getExams(userId) {
  const enrollments = await Enrollment.find({ studentId: userId, status: 'enrolled' });
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } });
  const courseMap = {};
  courses.forEach((c) => { courseMap[c._id.toString()] = { code: c.code, name: c.name }; });

  const exams = await Exam.find({ courseId: { $in: courseIds } }).sort({ examDate: 1 });
  return exams.map((x) => ({
    ...x.toObject(),
    id: x._id.toString(),
    date: x.examDate,
    title: x.title || x.courseName + ' Exam',
    type: x.type || 'Other',
    startTime: x.time?.split('-')[0]?.trim() || x.time,
    endTime: x.time?.split('-')[1]?.trim() || x.time,
    courseCode: courseMap[x.courseId.toString()]?.code,
    courseName: courseMap[x.courseId.toString()]?.name,
  }));
}

// ---- Notifications ----
async function getNotifications(userId) {
  return Notification.find({ userId }).sort({ createdAt: -1 });
}

async function markNotificationRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) throw { status: 404, message: 'Notification not found' };
  notification.read = true;
  await notification.save();
  return notification;
}

async function markAllNotificationsRead(userId) {
  await Notification.updateMany({ userId, read: false }, { read: true });
  return { message: 'All notifications marked as read' };
}

// ---- Users ----
async function getUsers() {
  const users = await User.find().select('-password');
  return users.map((u) => ({ ...u.toObject(), id: u._id.toString() }));
}

// ---- Enrollments ----
async function getEnrollments(userId) {
  return Enrollment.find({ studentId: userId });
}

// ---- All Courses (without enrollment data) ----
async function getAllCourses() {
  const courses = await Course.find().populate('professorId', 'firstName lastName');
  const enrollments = await Enrollment.find({ status: 'enrolled' });
  const countMap = {};
  enrollments.forEach((e) => {
    const key = e.courseId.toString();
    countMap[key] = (countMap[key] || 0) + 1;
  });
  return courses.map((c) => {
    const obj = c.toObject({ virtuals: true });
    return {
      ...obj,
      name: obj.name || obj.title,
      id: c._id.toString(),
      professorName: c.professorId ? `${c.professorId.firstName} ${c.professorId.lastName}` : 'TBA',
      professorId: c.professorId?._id?.toString() || c.professorId?.toString(),
      enrolledCount: countMap[c._id.toString()] || 0,
    };
  });
}

module.exports = {
  getDashboard, getCatalog, enroll, drop, getMyCourses, getClassroom,
  getAssignments, submitAssignment, getGrades, calculateGrade, getTranscript,
  getExams, getNotifications, markNotificationRead, markAllNotificationsRead,
  getUsers, getAllCourses, getEnrollments,
};
