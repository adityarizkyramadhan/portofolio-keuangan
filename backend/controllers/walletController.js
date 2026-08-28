const walletService = require('../services/walletService');

class WalletController {
  async getAll(req, res, next) {
    try {
      const wallets = await walletService.getWallets(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar dompet',
        data: wallets
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
      const transactions = await walletService.getTransactions(req.userId, limit);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar transaksi kas',
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const wallet = await walletService.createWallet(req.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Dompet berhasil dibuat',
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await walletService.deleteWallet(req.params.id, req.userId);
      res.status(200).json({
        success: true,
        message: 'Akun keuangan berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }

  async recordTransaction(req, res, next) {
    try {
      const result = await walletService.recordTransaction(req.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Transaksi kas berhasil dicatat',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const result = await walletService.transfer(req.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Transfer antar dompet berhasil',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async recalculate(req, res, next) {
    try {
      const updatedWallets = await walletService.recalculateBalances(req.userId);
      res.status(200).json({
        success: true,
        message: 'Hitung ulang saldo dan limit akun keuangan berhasil',
        data: updatedWallets
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
