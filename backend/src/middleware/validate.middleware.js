const { z } = require('zod');

// Reusable middleware factory
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Safer check: look directly for the issues/errors array provided by Zod
    const validationErrors = error.errors || error.issues;
    
    if (validationErrors && Array.isArray(validationErrors)) {
      return res.status(400).json({ 
        status: 'fail',
        errors: validationErrors.map(err => ({
          field: err.path[0] || 'field',
          message: err.message
        }))
      });
    }
    
    // Fallback for any other server errors
    return res.status(500).json({ message: error.message || "Internal server error during validation" });
  }
};

// Validation schemas
const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  role: z.enum(['admin', 'professor', 'student'], { message: "Invalid role selected" })
});

const loginSchema = z.object({
  email: z.string().min(1, { message: "Email or username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

module.exports = {
  validate,
  signupSchema,
  loginSchema
};