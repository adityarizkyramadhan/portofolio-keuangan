const app = require('../backend/app');
const { connectDB } = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("[Vercel Serverless] MongoDB Connection Error:", err);
  }
  return app(req, res);
};
