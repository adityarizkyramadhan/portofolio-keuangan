const accountRepository = require('../repositories/accountRepository');
const cashTransactionRepository = require('../repositories/cashTransactionRepository');

class AccountService {
  async getAccounts(userId) {
    return await accountRepository.findByUserId(userId);
  }

  async getAccountById(id, userId) {
    const account = await accountRepository.findById(id, userId);
    if (!account) {
      const err = new Error('Akun tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return account;
  }

  async createAccount(userId, { name, type, institutionName, accountNumber, balance }) {
    if (!name || !type) {
      const err = new Error('Nama dan tipe akun wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const validTypes = ['CASH', 'BANK', 'E_WALLET', 'RDN'];
    if (!validTypes.includes(type.toUpperCase())) {
      const err = new Error(`Tipe akun tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    return await accountRepository.create({
      userId,
      name: name.trim(),
      type: type.toUpperCase(),
      institutionName: institutionName ? institutionName.trim() : '',
      accountNumber: accountNumber ? accountNumber.trim() : '',
      balance: balance || 0
    });
  }

  async recordTransaction(userId, { accountId, categoryId, type, amount, note, date }) {
    if (!accountId || !type || amount === undefined || amount <= 0) {
      const err = new Error('AccountId, type (INCOME/EXPENSE), dan amount (> 0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const account = await this.getAccountById(accountId, userId);

    const transactionType = type.toUpperCase();
    if (!['INCOME', 'EXPENSE'].includes(transactionType)) {
      const err = new Error('Tipe transaksi harus INCOME atau EXPENSE');
      err.statusCode = 400;
      throw err;
    }

    if (transactionType === 'EXPENSE' && account.balance < amount) {
      const err = new Error('Saldo akun tidak mencukupi untuk transaksi ini');
      err.statusCode = 400;
      throw err;
    }

    const balanceChange = transactionType === 'INCOME' ? amount : -amount;
    await accountRepository.updateBalance(accountId, balanceChange);

    const transaction = await cashTransactionRepository.create({
      userId,
      accountId,
      categoryId,
      type: transactionType,
      amount,
      note,
      date
    });

    const updatedAccount = await accountRepository.findById(accountId, userId);

    return { transaction, updatedAccount };
  }

  async transferBetweenAccounts(userId, { sourceAccountId, destinationAccountId, amount, note, date }) {
    if (!sourceAccountId || !destinationAccountId || !amount || amount <= 0) {
      const err = new Error('SourceAccountId, destinationAccountId, dan amount (> 0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    if (sourceAccountId === destinationAccountId) {
      const err = new Error('Akun asal dan akun tujuan tidak boleh sama');
      err.statusCode = 400;
      throw err;
    }

    const sourceAccount = await this.getAccountById(sourceAccountId, userId);
    const destinationAccount = await this.getAccountById(destinationAccountId, userId);

    if (sourceAccount.balance < amount) {
      const err = new Error(`Saldo akun ${sourceAccount.name} tidak mencukupi untuk transfer ini`);
      err.statusCode = 400;
      throw err;
    }

    // Deduct from source, add to destination
    await accountRepository.updateBalance(sourceAccountId, -amount);
    await accountRepository.updateBalance(destinationAccountId, amount);

    const transferNote = note || `Transfer dari ${sourceAccount.name} ke ${destinationAccount.name}`;

    const transaction = await cashTransactionRepository.create({
      userId,
      accountId: sourceAccountId,
      destinationAccountId,
      type: 'TRANSFER',
      amount,
      note: transferNote,
      date
    });

    const updatedSource = await accountRepository.findById(sourceAccountId, userId);
    const updatedDestination = await accountRepository.findById(destinationAccountId, userId);

    return {
      transaction,
      sourceAccount: updatedSource,
      destinationAccount: updatedDestination
    };
  }

  async getTransactionHistory(userId) {
    return await cashTransactionRepository.findByUserId(userId);
  }
}

module.exports = new AccountService();
