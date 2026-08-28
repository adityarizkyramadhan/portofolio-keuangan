const accountService = require('../services/accountService');

class AccountController {
  async getAll(req, res, next) {
    try {
      const accounts = await accountService.getAccounts(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar akun',
        data: accounts
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const account = await accountService.getAccountById(req.params.id, req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil detail akun',
        data: account
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const account = await accountService.createAccount(req.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Akun berhasil dibuat',
        data: account
      });
    } catch (error) {
      next(error);
    }
  }

  async recordTransaction(req, res, next) {
    try {
      const result = await accountService.recordTransaction(req.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Transaksi berhasil dicatat',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const result = await accountService.transferBetweenAccounts(req.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Transfer antar akun berhasil',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const transactions = await accountService.getTransactionHistory(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil riwayat transaksi kas',
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AccountController();
