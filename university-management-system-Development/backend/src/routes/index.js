const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('../modules/admin/admin.routes');
const professorRoutes = require('../modules/professor/professor.routes'); // 1. Import professor routes

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/professor', professorRoutes); // 2. Mount professor routes under /api/professor

module.exports = router;