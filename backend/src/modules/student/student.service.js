// Mahmoud (Team Lead) — Student service: business logic for student operations

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

exports.scoreToLetter = (score) => {
  if (score == null) return null;
  const row = GRADE_SCALE.find((g) => score >= g.min);
  return row ? row.letter : 'F';
};

exports.scoreToPoints = (score) => {
  if (score == null) return null;
  const row = GRADE_SCALE.find((g) => score >= g.min);
  return row ? row.points : 0;
};

// Compute a course grade from all graded submissions for a student
exports.calculateCourseGrade = (submissions, assignments) => {
  const graded = (submissions || []).filter((s) => s.status === 'graded' && s.score != null);
  if (graded.length === 0) return null;
  const asgById = Object.fromEntries((assignments || []).map((a) => [(a._id || a.id).toString(), a]));
  let totalEarned = 0;
  let totalMax = 0;
  graded.forEach((s) => {
    const asg = asgById[(s.assignmentId || s._id).toString ? (s.assignmentId || s._id).toString() : s.assignmentId];
    if (asg) {
      totalEarned += s.score;
      totalMax += asg.maxScore || 100;
    }
  });
  if (totalMax === 0) return null;
  const totalCount = (assignments || []).length;
  const score = Math.round((totalEarned / totalMax) * 100);
  const row = GRADE_SCALE.find((g) => score >= g.min);
  const allGraded = graded.length >= totalCount;
  return {
    score,
    letter: row ? row.letter : 'F',
    points: row ? row.points : 0,
    status: allGraded ? 'final' : 'in-progress',
    gradedCount: graded.length,
    totalCount,
    totalEarned,
    totalMax,
  };
};

exports.calculateGPA = (grades, courseById) => {
  const finals = grades.filter((g) => g.status === 'final' && g.points != null);
  if (finals.length === 0) return { gpa: 0, credits: 0 };
  let totalPoints = 0;
  let totalCredits = 0;
  finals.forEach((g) => {
    const credits = courseById[g.courseId]?.credits || 0;
    totalPoints += g.points * credits;
    totalCredits += credits;
  });
  return {
    gpa: totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0,
    credits: totalCredits,
  };
};
