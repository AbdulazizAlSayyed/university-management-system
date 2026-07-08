// Mahmoud — Central error handler: converts errors into JSON responses { message }.
module.exports = (err, req, res, _next) => {
  console.error('[Error]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
};
