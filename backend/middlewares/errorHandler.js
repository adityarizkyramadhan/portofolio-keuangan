const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal server';

  logger.error(message, {
    context: 'ErrorHandler',
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

module.exports = errorHandler;
