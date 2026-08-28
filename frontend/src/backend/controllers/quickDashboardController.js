const quickDashboardService = require('../services/quickDashboardService');

class QuickDashboardController {
  async getDashboard(req, res, next) {
    try {
      const { year, month } = req.query;
      const data = await quickDashboardService.getDashboardData(req.userId, year, month);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil data Dasbor Keuangan',
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuickDashboardController();
