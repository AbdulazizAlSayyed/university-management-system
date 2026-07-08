const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const studentRoutes = require('../modules/student/student.routes');

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);

module.exports = router;
