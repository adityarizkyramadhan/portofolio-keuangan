const { createLogger, format, transports } = require('winston');

// Single-line log format with |@| delimiter
const onelinerFormat = format.printf(({ level, message, timestamp, stack, context, ...meta }) => {
  const ctx = context ? context : 'App';
  const msg = (stack || message).replace(/\r?\n\s*/g, ' ');
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  
  return [timestamp, level, `[${ctx}]`, msg, metaStr].filter(Boolean).join(' |@| ');
});

const loggerTransports = [
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      onelinerFormat
    )
  })
];

// Optionally add file transport only in local non-production environments
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  try {
    const path = require('path');
    const fs = require('fs');
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    loggerTransports.push(
      new transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error'
      }),
      new transports.File({
        filename: path.join(logDir, 'combined.log')
      })
    );
  } catch (err) {
    // Ignore file system errors on read-only environments
  }
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    onelinerFormat
  ),
  defaultMeta: { service: 'keuangan-backend' },
  transports: loggerTransports
});

module.exports = logger;
