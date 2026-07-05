// src/data/mockData.js


export const GRADE_SCALE = [
  { min: 90, letter: 'A', points: 4.0 },
  { min: 80, letter: 'B', points: 3.0 },
  { min: 70, letter: 'C', points: 2.0 },
  { min: 60, letter: 'D', points: 1.0 },
  { min: 0,  letter: 'F', points: 0.0 }
];


export const DEMO_CREDENTIALS = [
  
  {
    email: 'admin@unihub.edu',
    password: 'password123',
    role: 'admin',
    label: 'System Admin'
  }
];

export const CURRENT_SEMESTER = 'Fall 2026';

export const users = [
  {
    id: '6a4a19a84910d8f45690b1fb', // Matches your exact database ID
    firstName: 'Nada',
    lastName: 'Ahmad',
    email: 'nada@unihub.edu',
    personalEmail: 'nada@gmail.com',
    role: 'professor',
    status: 'active',
    avatarColor: 'bg-brand-600',
    createdAt: '2026-07-05'
  },
  {
    id: 'u-admin',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@unihub.edu',
    role: 'admin',
    status: 'active',
    avatarColor: 'bg-gray-700',
    createdAt: '2026-01-01'
  }
];

export const courses = [
  {
    id: 'c-fullstack-dev',
    code: 'CS310',
    name: 'Full-Stack Web Development',
    description: 'Building modern web applications using advanced frameworks.',
    credits: 3,
    capacity: 30,
    professorId: '6a4a19a84910d8f45690b1fb', // Pre-assigned to Nada
    semester: 'Fall 2026',
    schedule: 'Mon & Wed · 14:00–15:30',
    room: 'Lab C-12',
    color: 'bg-indigo-500',
    status: 'active'
  },
  {
    id: 'c-ui-ux',
    code: 'DS102',
    name: 'Introduction to UI/UX Design',
    description: 'User interface principles and experience layout paradigms.',
    credits: 3,
    capacity: 25,
    professorId: '6a4a19a84910d8f45690b1fb', // Pre-assigned to Nada
    semester: 'Fall 2026',
    schedule: 'Tue & Thu · 10:00–11:30',
    room: 'Room 402',
    color: 'bg-emerald-500',
    status: 'active'
  }
];

// Structural placeholders so DataContext imports don't crash
export const enrollments = [];
export const materials = [];
export const assignments = [];
export const submissions = [];
export const grades = [];
export const exams = [];
export const announcements = [];
export const attendance = [];
export const notifications = [];
export const calendarEvents = [];
export const auditLogs = [];