// Professor controller: handlers for courses, materials, assignments, grading, grades, attendance, announcements + dashboard.

const professorService = require('./professor.service');

const getDashboardOverview = async (req, res) => {
  try {
    // req.user.id should be provided by your auth middleware
    const data = await professorService.getDashboardStats(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignedCourses = async (req, res) => {
  try {
    const data = await professorService.getProfessorCourses(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getAssignedCourses 
};