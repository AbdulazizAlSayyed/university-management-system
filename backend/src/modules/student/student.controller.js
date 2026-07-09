const studentService = require('./student.service');

exports.getDashboard = async (req, res) => {
  try {
    const data = await studentService.getDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCatalog = async (req, res) => {
  try {
    const courses = await studentService.getCatalog();
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.enroll = async (req, res) => {
  try {
    const enrollment = await studentService.enroll(req.user.id, req.body.courseId);
    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.drop = async (req, res) => {
  try {
    await studentService.drop(req.user.id, req.params.courseId);
    res.json({ message: 'Dropped successfully' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const courses = await studentService.getMyCourses(req.user.id);
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getClassroom = async (req, res) => {
  try {
    const data = await studentService.getClassroom(req.user.id, req.params.courseId);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await studentService.getAssignments(req.user.id);
    res.json({ assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, fileName } = req.body;
    const submission = await studentService.submitAssignment(req.user.id, assignmentId, fileName);
    res.status(201).json({ message: 'Assignment submitted', submission });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGrades = async (req, res) => {
  try {
    const data = await studentService.getGrades(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.calculateGrade = async (req, res) => {
  try {
    const result = await studentService.calculateGrade(req.user.id, req.params.courseId);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTranscript = async (req, res) => {
  try {
    const data = await studentService.getTranscript(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await studentService.getExams(req.user.id);
    res.json({ exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await studentService.getNotifications(req.user.id);
    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await studentService.markNotificationRead(req.params.id, req.user.id);
    res.json({ notification });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await studentService.markAllNotificationsRead(req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await studentService.getUsers();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await studentService.getAllCourses();
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await studentService.getEnrollments(req.user.id);
    res.json({ enrollments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
