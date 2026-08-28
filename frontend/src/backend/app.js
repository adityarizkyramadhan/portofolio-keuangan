const express = require('express');
const cors = require('cors');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const walletRoutes = require('./routes/walletRoutes');
const simplePortfolioRoutes = require('./routes/simplePortfolioRoutes');
const quickDashboardRoutes = require('./routes/quickDashboardRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Keuangan berjalan dengan normal',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/portfolio', simplePortfolioRoutes);
app.use('/api/dashboard', quickDashboardRoutes);
app.use('/api/reminders', reminderRoutes);

// 404 Handler (JSON)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan di server backend.`
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
