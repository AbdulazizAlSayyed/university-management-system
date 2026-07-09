const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('../modules/admin/admin.routes');
const studentRoutes = require('../modules/student/student.routes');
const professorRoutes = require('../modules/professor/professor.routes');
const uploadRoutes = require('./upload.routes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);
router.use('/professor', professorRoutes);
router.use(uploadRoutes);

module.exports = router;
