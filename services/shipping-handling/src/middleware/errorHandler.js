function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);
  if (err.name === 'SequelizeValidationError') return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors.map(e => ({ field: e.path, message: e.message })) });
  if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ success: false, error: 'Duplicate entry' });
  if (err.name === 'SequelizeForeignKeyConstraintError') return res.status(400).json({ success: false, error: 'Referenced resource does not exist' });
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Internal Server Error', ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) });
}
module.exports = errorHandler;
