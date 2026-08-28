require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info("Memulai backend server...", { context: "Server Startup" });
    
    // Connect to MongoDB Atlas
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`Server berjalan di http://localhost:${PORT}`, {
        context: "Server Startup",
        port: PORT,
        env: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error("Gagal menjalankan server backend", {
      context: "Server Startup Error",
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

startServer();
