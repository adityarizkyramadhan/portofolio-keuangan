const assetRepository = require('../repositories/assetRepository');

class AssetService {
  async getAllAssets() {
    return await assetRepository.findAll();
  }

  async getAssetById(id) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      const err = new Error('Aset investasi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return asset;
  }

  async createAsset({ assetCode, assetName, assetType, currentPrice }) {
    if (!assetCode || !assetName || !assetType) {
      const err = new Error('AssetCode, assetName, dan assetType (SAHAM/REKSADANA/OBLIGASI/CRYPTO) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const existing = await assetRepository.findByCode(assetCode);
    if (existing) {
      const err = new Error(`Aset dengan kode ${assetCode.toUpperCase()} sudah terdaftar`);
      err.statusCode = 400;
      throw err;
    }

    const validTypes = ['SAHAM', 'REKSADANA', 'OBLIGASI', 'CRYPTO'];
    if (!validTypes.includes(assetType.toUpperCase())) {
      const err = new Error(`Tipe aset tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    return await assetRepository.create({
      assetCode: assetCode.trim(),
      assetName: assetName.trim(),
      assetType: assetType.toUpperCase(),
      currentPrice: currentPrice || 0
    });
  }

  async updateMarketPrice(id, currentPrice) {
    if (currentPrice === undefined || currentPrice < 0) {
      const err = new Error('Harga pasar (currentPrice) harus berupa angka non-negatif');
      err.statusCode = 400;
      throw err;
    }

    await this.getAssetById(id); // Check existence
    return await assetRepository.updatePrice(id, currentPrice);
  }
}

module.exports = new AssetService();
