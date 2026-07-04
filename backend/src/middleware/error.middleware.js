// Central error handler: turns errors into JSON { message }.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err.statusCode || 500
  let message = err.message || 'Server error'

  if (err.code === 11000) {
    status = 409
    message = 'Email is already registered.'
  }
  if (err.name === 'ValidationError') {
    status = 422
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  }
  res.status(status).json({ message })
}
