const express = require('express');
const router = express.Router();
const { validate, signupSchema, loginSchema } = require('../../middleware/validate.middleware');
const ctrl = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.post('/signup', validate(signupSchema), ctrl.signup);
router.post('/login', validate(loginSchema), ctrl.login);
router.patch('/profile', verifyToken, ctrl.updateProfile);

module.exports = router;
