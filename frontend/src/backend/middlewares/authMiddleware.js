const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_keuangan_123');
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token autentikasi tidak valid atau kadaluarsa', {
      context: 'AuthMiddleware',
      error: error.message
    });
    return res.status(401).json({
      success: false,
      message: 'Token autentikasi tidak valid atau telah kadaluarsa.'
    });
  }
}

module.exports = authMiddleware;
