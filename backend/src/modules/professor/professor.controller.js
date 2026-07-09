const professorService = require('./professor.service');

exports.getDashboard = async (req, res) => {
  try {
    const data = await professorService.getDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await professorService.getCourses(req.user.id);
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseDetail = async (req, res) => {
  try {
    const data = await professorService.getCourseDetail(req.user.id, req.params.courseId);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const data = await professorService.getMaterials(req.user.id, req.params.courseId);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addMaterial = async (req, res) => {
  try {
    const material = await professorService.addMaterial(req.user.id, req.params.courseId, req.body);
    res.status(201).json({ message: 'Material uploaded', material });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error('addMaterial error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const result = await professorService.deleteMaterial(req.user.id, req.params.courseId, req.params.materialId);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await professorService.getAnnouncements(req.user.id);
    res.json({ announcements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseAnnouncements = async (req, res) => {
  try {
    const announcements = await professorService.getCourseAnnouncements(req.user.id, req.params.courseId);
    res.json({ announcements });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addAnnouncement = async (req, res) => {
  try {
    const announcement = await professorService.addAnnouncement(req.user.id, req.params.courseId, req.body);
    res.status(201).json({ message: 'Announcement posted', announcement });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const result = await professorService.deleteAnnouncement(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await professorService.getAssignments(req.user.id);
    res.json({ assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseAssignments = async (req, res) => {
  try {
    const assignments = await professorService.getCourseAssignments(req.user.id, req.params.courseId);
    res.json({ assignments });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addAssignment = async (req, res) => {
  try {
    const assignment = await professorService.addAssignment(req.user.id, req.params.courseId, req.body);
    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const result = await professorService.deleteAssignment(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await professorService.getSubmissions(req.user.id);
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await professorService.gradeSubmission(req.user.id, req.params.id, score, feedback);
    res.json({ message: 'Submission graded', submission });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseGrades = async (req, res) => {
  try {
    const data = await professorService.getCourseGrades(req.user.id, req.params.courseId);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setFinalGrade = async (req, res) => {
  try {
    const { studentId, score } = req.body;
    const grade = await professorService.setFinalGrade(req.user.id, req.params.courseId, studentId, score);
    res.json({ message: 'Grade saved', grade });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const records = await professorService.getAllAttendance(req.user.id);
    res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseAttendance = async (req, res) => {
  try {
    const records = await professorService.getCourseAttendance(req.user.id, req.params.courseId);
    res.json({ records });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.saveAttendance = async (req, res) => {
  try {
    const attendance = await professorService.saveAttendance(req.user.id, req.params.courseId, req.body);
    res.status(201).json({ message: 'Attendance saved', attendance });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await professorService.getUsers();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await professorService.getEnrollments();
    res.json({ enrollments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- Notifications ----
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await professorService.getNotifications(req.user.id);
    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await professorService.markNotificationRead(req.params.id, req.user.id);
    res.json({ notification });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await professorService.markAllNotificationsRead(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
