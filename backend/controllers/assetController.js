const assetService = require('../services/assetService');

class AssetController {
  async getAll(req, res, next) {
    try {
      const assets = await assetService.getAllAssets();
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar master aset',
        data: assets
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil detail aset',
        data: asset
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const asset = await assetService.createAsset(req.body);
      res.status(201).json({
        success: true,
        message: 'Master aset berhasil dibuat',
        data: asset
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePrice(req, res, next) {
    try {
      const updatedAsset = await assetService.updateMarketPrice(req.params.id, req.body.currentPrice);
      res.status(200).json({
        success: true,
        message: 'Harga pasar aset berhasil diperbarui (Mark-to-Market)',
        data: updatedAsset
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssetController();
