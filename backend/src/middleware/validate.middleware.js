import { validationResult } from 'express-validator'

<<<<<<< HEAD
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
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

    return res.status(500).json({ message: error.message || "Internal server error during validation" });
  }
};

// Student/professor submitting a request — no password, no admin option.
const requestAccountSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  personalEmail: z.string().email({ message: "Invalid email format" }),
  role: z.enum(['professor', 'student'], { message: "Invalid role selected" }),
  dateOfBirth: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" })
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email format" })
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});

// Admin creating/approving a user account directly.
const adminCreateUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  personalEmail: z.string().email(),
  email: z.string().email(),
  role: z.enum(['admin', 'professor', 'student']),
  username: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  studentId: z.string().optional(),
  program: z.string().optional(),
  year: z.number().optional()
});

module.exports = {
  validate,
  requestAccountSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  adminCreateUserSchema
};
=======
// Runs express-validator chains and returns 422 on failure.
export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array().map((e) => e.msg).join(', ') })
  }
  next()
}
>>>>>>> Development
