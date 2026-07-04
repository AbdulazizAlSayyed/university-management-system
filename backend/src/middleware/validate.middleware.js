import { validationResult } from 'express-validator'

// Runs express-validator chains and returns 422 on failure.
export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array().map((e) => e.msg).join(', ') })
  }
  next()
}
