import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

// Reads the Bearer token, verifies it, and attaches req.user.
export const verifyToken = asyncHandler(async (req, res, next) => {
  let token
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) token = header.split(' ')[1]
  if (!token) throw new ApiError(401, 'Not authorized, no token')

  const secret = process.env.JWT_SECRET || 'dev_secret_change_me'
  const decoded = jwt.verify(token, secret)
  const user = await User.findById(decoded.id)
  if (!user) throw new ApiError(401, 'User no longer exists')
  req.user = user
  next()
})
