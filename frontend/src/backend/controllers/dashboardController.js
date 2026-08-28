const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getNetWorthSummary(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil ringkasan Net Worth',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getHoldings(req, res, next) {
    try {
      const holdings = await dashboardService.getHoldingsSummary(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil ringkasan Holdings portofolio',
        data: holdings
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllocation(req, res, next) {
    try {
      const allocation = await dashboardService.getAssetAllocation(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil data alokasi aset',
        data: allocation
      });
    } catch (error) {
      next(error);
    }
  }

  async getRealizedReturns(req, res, next) {
    try {
      const report = await dashboardService.getRealizedReturnReport(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil laporan Realized Return',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
