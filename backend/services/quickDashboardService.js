const walletRepository = require('../repositories/walletRepository');
const simpleAssetRepository = require('../repositories/simpleAssetRepository');
const cashTransactionRepository = require('../repositories/cashTransactionRepository');

class QuickDashboardService {
  async getExchangeRates() {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/IDR');
      const data = await response.json();
      if (data && data.rates) return data.rates;
    } catch (e) {
      console.warn('[QuickDashboardService] Error fetching live rates:', e.message);
    }
    return {
      USD: 1 / 15800,
      CNY: 1 / 2180,
      MYR: 1 / 3550,
      GBP: 1 / 20100,
      SAR: 1 / 4210
    };
  }

  resolveCurrency(w) {
    if (w.currency && w.currency !== 'IDR') return w.currency;
    const nameUpper = (w.name || '').toUpperCase();
    if (nameUpper.includes('USD')) return 'USD';
    if (nameUpper.includes('CNY')) return 'CNY';
    if (nameUpper.includes('MYR')) return 'MYR';
    if (nameUpper.includes('GBP')) return 'GBP';
    if (nameUpper.includes('SAR')) return 'SAR';
    return w.currency || 'IDR';
  }

  async getDashboardData(userId, queryYear = null, queryMonth = null) {
    const rates = await this.getExchangeRates();

    // 1. Wallets & Bank Accounts (Converting foreign liquid balances to IDR)
    const wallets = await walletRepository.findByUserId(userId);
    let totalWalletsBalance = 0;
    let totalCreditCardDebt = 0;

    for (const w of wallets) {
      const currency = this.resolveCurrency(w);
      if (w.type === 'CREDIT_CARD') {
        const limit = Number(w.creditLimit) || 0;
        const remaining = Number(w.balance);
        const used = limit > 0 ? Math.max(0, limit - remaining) : 0;
        const usedInIdr = (currency !== 'IDR' && rates[currency]) ? (used / rates[currency]) : used;
        totalCreditCardDebt += usedInIdr;
      } else {
        const rawBalance = Number(w.balance) || 0;
        const balanceInIdr = (currency !== 'IDR' && rates[currency]) ? (rawBalance / rates[currency]) : rawBalance;
        totalWalletsBalance += balanceInIdr;
      }
    }

    // 2. Simple Assets Total (Investasi)
    const assets = await simpleAssetRepository.findByUserId(userId);
    const totalAssetsValue = assets.reduce((sum, a) => sum + (Number(a.totalValue) || 0), 0);

    // 3. Net Worth Total = Total Kas/Bank Murni (Termasuk Valas) + Investasi - Tagihan CC
    const netWorth = totalWalletsBalance + totalAssetsValue - totalCreditCardDebt;

    // 4. Allocation (Pie Chart Data)
    const allocationMap = {
      'Kas & Bank (IDR & Valas)': totalWalletsBalance
    };

    for (const asset of assets) {
      const type = asset.type || 'Saham';
      allocationMap[type] = (allocationMap[type] || 0) + (Number(asset.totalValue) || 0);
    }

    const allocationList = Object.keys(allocationMap).map(category => {
      const val = allocationMap[category];
      const percent = netWorth > 0 ? (val / netWorth) * 100 : 0;
      return {
        name: category,
        value: Number(val.toFixed(2)),
        percentage: Number(percent.toFixed(2))
      };
    });

    // 5. Monthly Cash Flow (Filtered by target Year & Month)
    const now = new Date();
    const year = queryYear ? parseInt(queryYear, 10) : now.getFullYear();
    const month = queryMonth ? parseInt(queryMonth, 10) - 1 : now.getMonth(); // 0-indexed

    const targetDate = new Date(year, month, 1);
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    const cashTransactions = await cashTransactionRepository.findByUserId(userId, 1000);

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const tx of cashTransactions) {
      const txDate = new Date(tx.date || tx.createdAt);
      if (txDate >= startOfMonth && txDate <= endOfMonth) {
        if (tx.type === 'INCOME') {
          monthlyIncome += Number(tx.amount) || 0;
        } else if (tx.type === 'EXPENSE') {
          monthlyExpense += Number(tx.amount) || 0;
        }
      }
    }

    const netSavings = monthlyIncome - monthlyExpense;

    return {
      netWorth,
      totalWalletsBalance,
      totalAssetsValue,
      totalCreditCardDebt,
      monthlyCashFlow: {
        income: monthlyIncome,
        expense: monthlyExpense,
        netSavings,
        year,
        month: month + 1,
        monthName: targetDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
      },
      allocation: allocationList,
      wallets,
      assets
    };
  }
}

module.exports = new QuickDashboardService();
