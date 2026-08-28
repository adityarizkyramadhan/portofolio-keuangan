const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Single-line log format with |@| delimiter
const onelinerFormat = format.printf(({ level, message, timestamp, stack, context, ...meta }) => {
  const ctx = context ? context : 'App';
  const msg = (stack || message).replace(/\r?\n\s*/g, ' ');
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  
  return [timestamp, level, `[${ctx}]`, msg, metaStr].filter(Boolean).join(' |@| ');
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    onelinerFormat
  ),
  defaultMeta: { service: 'keuangan-backend' },
  transports: [
    // File transport for errors
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // File transport for all logs
    new transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      onelinerFormat
    )
  }));
}

module.exports = logger;
