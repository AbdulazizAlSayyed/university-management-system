import User from '../../models/User.js'
import ApiError from '../../utils/ApiError.js'

// Create a new user (self-registration). Password is hashed by the model hook.
export async function registerUser(data) {
  const { firstName, lastName, email, password, role } = data
  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(422, 'firstName, lastName, email and password are required')
  }
  const exists = await User.findOne({ email: String(email).toLowerCase() })
  if (exists) throw new ApiError(409, 'Email is already registered.')

  return User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'student',
    status: 'active', // self-registered accounts are active in this demo
    username: `${firstName} ${lastName}`.trim(),
  })
}

// Authenticate by email OR username + password.
export async function loginUser(identifier, password) {
  if (!identifier || !password) throw new ApiError(422, 'Email and password are required')
  const id = String(identifier).toLowerCase()
  const user = await User.findOne({
    $or: [{ email: id }, { username: identifier }],
  }).select('+password')
  if (!user) throw new ApiError(401, 'Invalid email or password.')
  const match = await user.matchPassword(password)
  if (!match) throw new ApiError(401, 'Invalid email or password.')
  return user
}
