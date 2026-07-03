const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { validate, signupSchema, loginSchema } = require('../middleware/validate.middleware');

// Route middleware intercepting requests for validation
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

module.exports = router;