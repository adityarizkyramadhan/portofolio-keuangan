const simpleAssetRepository = require('../repositories/simpleAssetRepository');
const walletRepository = require('../repositories/walletRepository');
const investmentTransactionRepository = require('../repositories/investmentTransactionRepository');

class SimplePortfolioService {
  async getAssets(userId) {
    return await simpleAssetRepository.findByUserId(userId);
  }

  async createAsset(userId, { name, type, totalValue }) {
    if (!name) {
      const err = new Error('Nama aset investasi wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    return await simpleAssetRepository.create({
      userId,
      name: name.trim(),
      type: type || 'Saham',
      totalValue: Number(totalValue) || 0
    });
  }

  async buyOrSell(userId, { action, assetId, rdnWalletId, amountRp, date }) {
    const numAmount = Number(amountRp);
    if (!action || !assetId || !rdnWalletId || !numAmount || numAmount <= 0) {
      const err = new Error('Action (BUY/SELL), assetId, rdnWalletId, dan amountRp (>0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const isBuy = action.toUpperCase() === 'BUY';
    const isSell = action.toUpperCase() === 'SELL';

    if (!isBuy && !isSell) {
      const err = new Error('Action harus BUY atau SELL');
      err.statusCode = 400;
      throw err;
    }

    // 1. Verify RDN Wallet
    const rdn = await walletRepository.findById(rdnWalletId, userId);
    if (!rdn) {
      const err = new Error('Akun/Dompet RDN tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (isBuy && rdn.balance < numAmount) {
      const err = new Error(`Saldo RDN ${rdn.name} tidak mencukupi (Tersedia: Rp ${rdn.balance.toLocaleString('id-ID')})`);
      err.statusCode = 400;
      throw err;
    }

    // 2. Verify Asset
    const asset = await simpleAssetRepository.findById(assetId, userId);
    if (!asset) {
      const err = new Error('Aset investasi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (isSell && asset.totalValue < numAmount) {
      const err = new Error(`Nilai aset ${asset.name} (Rp ${asset.totalValue.toLocaleString('id-ID')}) kurang dari nominal jual (Rp ${numAmount.toLocaleString('id-ID')})`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Execute balance & asset value adjustments
    if (isBuy) {
      await walletRepository.updateBalance(rdnWalletId, -numAmount);
      await simpleAssetRepository.adjustValue(assetId, userId, numAmount);
    } else {
      await walletRepository.updateBalance(rdnWalletId, numAmount);
      await simpleAssetRepository.adjustValue(assetId, userId, -numAmount);
    }

    // 4. Record mutation history
    const tx = await investmentTransactionRepository.create({
      userId,
      rdnAccountId: rdnWalletId,
      assetId,
      type: action.toUpperCase(),
      units: 1,
      pricePerUnit: numAmount,
      totalAmount: numAmount,
      date
    });

    const updatedAsset = await simpleAssetRepository.findById(assetId, userId);
    const updatedRdn = await walletRepository.findById(rdnWalletId, userId);

    return { transaction: tx, asset: updatedAsset, rdnWallet: updatedRdn };
  }

  async updateAssetTotalValue(userId, assetId, newTotalValue) {
    const val = Number(newTotalValue);
    if (isNaN(val) || val < 0) {
      const err = new Error('Nilai aset (newTotalValue) harus berupa angka non-negatif');
      err.statusCode = 400;
      throw err;
    }

    const asset = await simpleAssetRepository.findById(assetId, userId);
    if (!asset) {
      const err = new Error('Aset investasi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    const updated = await simpleAssetRepository.updateValue(assetId, userId, val);
    return updated;
  }
}

module.exports = new SimplePortfolioService();
