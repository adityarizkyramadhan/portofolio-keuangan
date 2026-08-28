const simplePortfolioService = require('../services/simplePortfolioService');

class SimplePortfolioController {
  async getAssets(req, res, next) {
    try {
      const assets = await simplePortfolioService.getAssets(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar aset portofolio',
        data: assets
      });
    } catch (error) {
      next(error);
    }
  }

  async createAsset(req, res, next) {
    try {
      const asset = await simplePortfolioService.createAsset(req.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Aset investasi berhasil ditambahkan',
        data: asset
      });
    } catch (error) {
      next(error);
    }
  }

  async buyOrSell(req, res, next) {
    try {
      const result = await simplePortfolioService.buyOrSell(req.userId, req.body);
      res.status(200).json({
        success: true,
        message: `Transaksi ${req.body.action} aset berhasil dicatat`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateValue(req, res, next) {
    try {
      const updatedAsset = await simplePortfolioService.updateAssetTotalValue(req.userId, req.params.id, req.body.newTotalValue);
      res.status(200).json({
        success: true,
        message: 'Total nilai aset berhasil diperbarui secara manual',
        data: updatedAsset
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SimplePortfolioController();
