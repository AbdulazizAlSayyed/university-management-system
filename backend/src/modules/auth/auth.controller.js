import { asyncHandler } from '../../utils/asyncHandler.js'
import { generateToken } from '../../utils/generateToken.js'
import { registerUser, loginUser } from './auth.service.js'

// POST /api/auth/signup  (alias: /register)
export const signup = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body)
  const token = generateToken(user)
  res.status(201).json({ user: user.toJSON(), token })
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await loginUser(email, password)
  const token = generateToken(user)
  res.json({ user: user.toJSON(), token })
})

// GET /api/auth/me  (protected)
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() })
})
