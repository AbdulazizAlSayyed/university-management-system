import { asyncHandler } from '../../utils/asyncHandler.js'
import { generateToken } from '../../utils/generateToken.js'
import * as svc from './auth.service.js'

export const signup = asyncHandler(async (req, res) => {
  const user = await svc.registerUser(req.body)
  const token = generateToken(user)
  res.status(201).json({ user: user.toJSON(), token })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await svc.loginUser(email, password)
  const token = generateToken(user)
  res.json({ user: user.toJSON(), token })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() })
})

export const updateMe = asyncHandler(async (req, res) => {
  const user = await svc.updateMe(req.user._id, req.body)
  res.json({ user: user.toJSON() })
})

export const changePassword = asyncHandler(async (req, res) => {
  await svc.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword)
  res.json({ message: 'Password updated successfully' })
})
