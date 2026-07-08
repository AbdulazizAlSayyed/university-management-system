import User from '../../models/User.js'
import ApiError from '../../utils/ApiError.js'
import { notifyAdmins } from '../../utils/notify.js'

export async function registerUser(data) {
  const { firstName, lastName, email, password, role } = data
  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(422, 'firstName, lastName, email and password are required')
  }
  const exists = await User.findOne({ email: String(email).toLowerCase() })
  if (exists) throw new ApiError(409, 'Email is already registered.')

  const user = await User.create({
    firstName, lastName, email, password,
    role: role || 'student',
    status: 'active',
    username: `${firstName} ${lastName}`.trim(),
  })
  await notifyAdmins({
    type: 'system',
    title: 'New user registered',
    body: `${firstName} ${lastName} (${user.role}) just created an account.`,
    link: '/admin/users',
  })
  return user
}

export async function loginUser(identifier, password) {
  if (!identifier || !password) throw new ApiError(422, 'Email and password are required')
  const id = String(identifier).toLowerCase()
  const user = await User.findOne({ $or: [{ email: id }, { username: identifier }] }).select('+password')
  if (!user) throw new ApiError(401, 'Invalid email or password.')
  const match = await user.matchPassword(password)
  if (!match) throw new ApiError(401, 'Invalid email or password.')
  return user
}

export async function updateMe(userId, data) {
  const allowed = ['firstName', 'lastName', 'email', 'phone', 'department', 'title', 'program', 'studentId', 'username']
  const patch = {}
  for (const k of allowed) if (data[k] !== undefined) patch[k] = data[k]
  if (patch.email) {
    const exists = await User.findOne({ email: String(patch.email).toLowerCase(), _id: { $ne: userId } })
    if (exists) throw new ApiError(409, 'Email is already in use.')
  }
  const user = await User.findByIdAndUpdate(userId, patch, { new: true, runValidators: true })
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) throw new ApiError(422, 'Current and new password are required')
  if (String(newPassword).length < 6) throw new ApiError(422, 'New password must be at least 6 characters')
  const user = await User.findById(userId).select('+password')
  if (!user) throw new ApiError(404, 'User not found')
  const ok = await user.matchPassword(currentPassword)
  if (!ok) throw new ApiError(401, 'Current password is incorrect')
  user.password = newPassword
  await user.save()
  return true
}
