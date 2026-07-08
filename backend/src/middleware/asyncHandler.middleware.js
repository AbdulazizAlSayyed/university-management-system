// Mahmoud — Wraps async route handlers so you never write try/catch in controllers
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
