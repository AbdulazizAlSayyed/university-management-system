// Professor service: business logic for professor operations (uses shared models).

const User = require('../../models/User');
// Assuming you have a Course schema that tracks enrolled students
const Course = require('../../models/Course'); 

const getDashboardStats = async (professorId) => {
  // 1. Fetch the professor along with their assigned courses
  const professor = await User.findById(professorId).populate('assignedCourses');
  if (!professor) throw new Error('Professor not found');

  const assignedCourses = professor.assignedCourses || [];
  const courseIds = assignedCourses.map(c => c._id);

  // 2. Calculate Total Unique Students across all assigned courses
  // This assumes your Course model has an 'enrolledStudents' array or similar field
  const totalStudentsCount = await User.countDocuments({
    role: 'student',
    enrolledCourses: { $in: courseIds }
  });

  // 3. Placeholder placeholders for assignments/grading (add real counts as models grow)
  const pendingGradingCount = 0; 
  const upcomingDeadlinesCount = 0;

  return {
    courses: assignedCourses,
    stats: {
      totalCourses: assignedCourses.length,
      totalStudents: totalStudentsCount,
      pendingGrading: pendingGradingCount,
      upcomingDeadlines: upcomingDeadlinesCount
    }
  };
};

const getProfessorCourses = async (professorId) => {
  const professor = await User.findById(professorId).populate('assignedCourses');
  if (!professor) throw new Error('Professor not found');
  
  return professor.assignedCourses || [];
};

module.exports = {
  getDashboardStats,
  getProfessorCourses 
};