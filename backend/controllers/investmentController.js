const investmentService = require('../services/investmentService');

class InvestmentController {
  async buy(req, res, next) {
    try {
      const result = await investmentService.buyAsset(req.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Transaksi pembelian aset berhasil dicatat',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async sell(req, res, next) {
    try {
      const result = await investmentService.sellAsset(req.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Transaksi penjualan aset berhasil dicatat',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async dividend(req, res, next) {
    try {
      const result = await investmentService.recordDividend(req.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Pencatatan dividen/imbal hasil berhasil',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await investmentService.getTransactionHistory(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil riwayat transaksi investasi',
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvestmentController();
