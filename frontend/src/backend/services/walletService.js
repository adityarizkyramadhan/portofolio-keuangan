const walletRepository = require('../repositories/walletRepository');
const cashTransactionRepository = require('../repositories/cashTransactionRepository');
const categoryRepository = require('../repositories/categoryRepository');

class WalletService {
  async getWallets(userId) {
    return await walletRepository.findByUserId(userId);
  }

  async getTransactions(userId, limit = 100) {
    const transactions = await cashTransactionRepository.findByUserId(userId, limit);
    const wallets = await walletRepository.findByUserId(userId);
    const categories = await categoryRepository.findByUserId(userId);

    const walletMap = new Map(wallets.map(w => [w._id.toString(), w]));
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c]));

    return transactions.map(tx => {
      const acc = walletMap.get(tx.accountId?.toString());
      const destAcc = tx.destinationAccountId ? walletMap.get(tx.destinationAccountId?.toString()) : null;
      const cat = tx.categoryId ? categoryMap.get(tx.categoryId?.toString()) : null;

      return {
        ...tx,
        accountName: acc ? acc.name : 'Akun Tidak Dikenal',
        accountCurrency: acc ? (acc.currency || 'IDR') : 'IDR',
        destinationAccountName: destAcc ? destAcc.name : null,
        categoryName: cat ? cat.name : (tx.type === 'TRANSFER' ? 'Transfer' : 'Lainnya'),
        categoryIcon: cat ? cat.icon : null
      };
    });
  }

  async createWallet(userId, { name, type, currency, institutionName, accountNumber, balance, creditLimit, remainingLimit }) {
    if (!name || !type) {
      const err = new Error('Nama dan tipe dompet wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const walletType = type.toUpperCase();
    const isCreditCard = walletType === 'CREDIT_CARD';

    // For credit card, balance can represent remaining limit or used balance
    const numCreditLimit = isCreditCard ? (Number(creditLimit) || 0) : 0;
    const numRemainingLimit = isCreditCard ? (Number(remainingLimit) || numCreditLimit) : 0;
    const initialBalance = isCreditCard ? numRemainingLimit : (Number(balance) || 0);

    return await walletRepository.create({
      userId,
      name: name.trim(),
      type: walletType,
      currency: currency ? currency.toUpperCase() : 'IDR',
      institutionName: institutionName ? institutionName.trim() : '',
      accountNumber: accountNumber ? accountNumber.trim() : '',
      balance: initialBalance,
      creditLimit: numCreditLimit,
      remainingLimit: numRemainingLimit
    });
  }

  async deleteWallet(id, userId) {
    const deleted = await walletRepository.delete(id, userId);
    if (!deleted) {
      const err = new Error('Akun keuangan tidak ditemukan atau tidak dapat dihapus');
      err.statusCode = 404;
      throw err;
    }
    return true;
  }

  async recordTransaction(userId, { walletId, categoryId, type, amount, note, date }) {
    if (!walletId || !type || amount === undefined || Number(amount) <= 0) {
      const err = new Error('WalletId, type (INCOME/EXPENSE), dan amount (>0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const wallet = await walletRepository.findById(walletId, userId);
    if (!wallet) {
      const err = new Error('Dompet tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    const transactionType = type.toUpperCase();
    const numAmount = Number(amount);

    if (transactionType === 'EXPENSE' && wallet.type !== 'CREDIT_CARD' && wallet.balance < numAmount) {
      const err = new Error(`Saldo dompet ${wallet.name} tidak mencukupi`);
      err.statusCode = 400;
      throw err;
    }

    const balanceChange = transactionType === 'INCOME' ? numAmount : -numAmount;
    await walletRepository.updateBalance(walletId, balanceChange);

    const tx = await cashTransactionRepository.create({
      userId,
      accountId: walletId,
      categoryId,
      type: transactionType,
      amount: numAmount,
      note,
      date
    });

    const updatedWallet = await walletRepository.findById(walletId, userId);
    return { transaction: tx, wallet: updatedWallet };
  }

  async transfer(userId, { sourceWalletId, destinationWalletId, amount, note, date }) {
    const numAmount = Number(amount);
    if (!sourceWalletId || !destinationWalletId || !numAmount || numAmount <= 0) {
      const err = new Error('SourceWalletId, destinationWalletId, dan amount (>0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    if (sourceWalletId === destinationWalletId) {
      const err = new Error('Dompet asal dan dompet tujuan tidak boleh sama');
      err.statusCode = 400;
      throw err;
    }

    const source = await walletRepository.findById(sourceWalletId, userId);
    const dest = await walletRepository.findById(destinationWalletId, userId);

    if (!source || !dest) {
      const err = new Error('Dompet asal atau dompet tujuan tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (source.type !== 'CREDIT_CARD' && source.balance < numAmount) {
      const err = new Error(`Saldo dompet ${source.name} tidak mencukupi untuk transfer ini`);
      err.statusCode = 400;
      throw err;
    }

    await walletRepository.updateBalance(sourceWalletId, -numAmount);
    await walletRepository.updateBalance(destinationWalletId, numAmount);

    const tx = await cashTransactionRepository.create({
      userId,
      accountId: sourceWalletId,
      destinationAccountId: destinationWalletId,
      type: 'TRANSFER',
      amount: numAmount,
      note: note || `Transfer dari ${source.name} ke ${dest.name}`,
      date
    });

    const updatedSource = await walletRepository.findById(sourceWalletId, userId);
    const updatedDest = await walletRepository.findById(destinationWalletId, userId);

    return { transaction: tx, sourceWallet: updatedSource, destinationWallet: updatedDest };
  }

  async recalculateBalances(userId) {
    const wallets = await walletRepository.findByUserId(userId);
    const transactions = await cashTransactionRepository.findByUserId(userId, 100000);

    const walletMap = new Map();
    wallets.forEach(w => {
      walletMap.set(w._id.toString(), {
        wallet: w,
        netTransactions: 0
      });
    });

    for (const tx of transactions) {
      const srcId = tx.accountId?.toString();
      const destId = tx.destinationAccountId?.toString();
      const amount = Number(tx.amount) || 0;

      if (tx.type === 'INCOME') {
        if (walletMap.has(srcId)) {
          walletMap.get(srcId).netTransactions += amount;
        }
      } else if (tx.type === 'EXPENSE') {
        if (walletMap.has(srcId)) {
          walletMap.get(srcId).netTransactions -= amount;
        }
      } else if (tx.type === 'TRANSFER') {
        if (walletMap.has(srcId)) {
          walletMap.get(srcId).netTransactions -= amount;
        }
        if (destId && walletMap.has(destId)) {
          walletMap.get(destId).netTransactions += amount;
        }
      }
    }

    const updatedWallets = [];
    for (const { wallet, netTransactions } of walletMap.values()) {
      let recalculatedBalance = 0;
      let recalculatedRemaining = 0;

      if (wallet.type === 'CREDIT_CARD') {
        const limit = Number(wallet.creditLimit) || 0;
        recalculatedBalance = limit + netTransactions;
        recalculatedRemaining = recalculatedBalance;
      } else {
        const baseBalance = wallet.initialBalance !== undefined ? Number(wallet.initialBalance) : Number(wallet.balance) - netTransactions;
        recalculatedBalance = baseBalance + netTransactions;
        recalculatedRemaining = recalculatedBalance;
      }

      const updated = await walletRepository.updateBalanceAndLimit(
        wallet._id,
        recalculatedBalance,
        recalculatedRemaining
      );
      if (updated) updatedWallets.push(updated);
    }

    return updatedWallets;
  }
}

module.exports = new WalletService();
