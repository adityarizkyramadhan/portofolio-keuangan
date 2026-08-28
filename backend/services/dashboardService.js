const accountRepository = require('../repositories/accountRepository');
const assetRepository = require('../repositories/assetRepository');
const holdingRepository = require('../repositories/holdingRepository');
const investmentTransactionRepository = require('../repositories/investmentTransactionRepository');

class DashboardService {
  async getNetWorthSummary(userId) {
    const accounts = await accountRepository.findByUserId(userId);
    const totalCashBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    const holdings = await holdingRepository.findByUserId(userId);
    const activeHoldings = holdings.filter(h => h.totalUnits > 0);

    let totalInvestmentMarketValue = 0;
    let totalInvestedCost = 0;

    for (const holding of activeHoldings) {
      const asset = await assetRepository.findById(holding.assetId);
      const currentPrice = asset ? asset.currentPrice : 0;
      const marketValue = holding.totalUnits * currentPrice;
      const investedCost = holding.totalUnits * holding.averageBuyPrice;

      totalInvestmentMarketValue += marketValue;
      totalInvestedCost += investedCost;
    }

    const netWorth = totalCashBalance + totalInvestmentMarketValue;
    const totalUnrealizedPnl = totalInvestmentMarketValue - totalInvestedCost;
    const totalUnrealizedPnlPercentage = totalInvestedCost > 0 ? (totalUnrealizedPnl / totalInvestedCost) * 100 : 0;

    return {
      netWorth,
      totalCashBalance,
      totalInvestmentMarketValue,
      totalInvestedCost,
      totalUnrealizedPnl,
      totalUnrealizedPnlPercentage: Number(totalUnrealizedPnlPercentage.toFixed(2)),
      accountBreakdown: accounts.map(acc => ({
        _id: acc._id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance
      }))
    };
  }

  async getHoldingsSummary(userId) {
    const holdings = await holdingRepository.findByUserId(userId);
    const activeHoldings = holdings.filter(h => h.totalUnits > 0);

    const result = [];

    for (const holding of activeHoldings) {
      const asset = await assetRepository.findById(holding.assetId);
      const currentPrice = asset ? asset.currentPrice : 0;
      const totalInvestedValue = holding.totalUnits * holding.averageBuyPrice;
      const currentMarketValue = holding.totalUnits * currentPrice;
      const unrealizedPnl = currentMarketValue - totalInvestedValue;
      const unrealizedPnlPercentage = totalInvestedValue > 0 ? (unrealizedPnl / totalInvestedValue) * 100 : 0;

      result.push({
        holdingId: holding._id,
        assetId: holding.assetId,
        assetCode: asset ? asset.assetCode : 'UNKNOWN',
        assetName: asset ? asset.assetName : 'Aset Tidak Ditemukan',
        assetType: asset ? asset.assetType : 'LAINNYA',
        totalUnits: holding.totalUnits,
        averageBuyPrice: Number(holding.averageBuyPrice.toFixed(2)),
        currentPrice,
        totalInvestedValue: Number(totalInvestedValue.toFixed(2)),
        currentMarketValue: Number(currentMarketValue.toFixed(2)),
        unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
        unrealizedPnlPercentage: Number(unrealizedPnlPercentage.toFixed(2))
      });
    }

    return result;
  }

  async getAssetAllocation(userId) {
    const accounts = await accountRepository.findByUserId(userId);
    const totalCashBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    const holdings = await holdingRepository.findByUserId(userId);
    const activeHoldings = holdings.filter(h => h.totalUnits > 0);

    const allocationMap = {
      CASH: totalCashBalance
    };

    let totalNetWorth = totalCashBalance;

    for (const holding of activeHoldings) {
      const asset = await assetRepository.findById(holding.assetId);
      const type = asset ? asset.assetType : 'LAINNYA';
      const marketValue = holding.totalUnits * (asset ? asset.currentPrice : 0);

      allocationMap[type] = (allocationMap[type] || 0) + marketValue;
      totalNetWorth += marketValue;
    }

    const allocationList = Object.keys(allocationMap).map(category => {
      const value = allocationMap[category];
      const percentage = totalNetWorth > 0 ? (value / totalNetWorth) * 100 : 0;
      return {
        category,
        value: Number(value.toFixed(2)),
        percentage: Number(percentage.toFixed(2))
      };
    });

    return {
      totalNetWorth: Number(totalNetWorth.toFixed(2)),
      allocations: allocationList
    };
  }

  async getRealizedReturnReport(userId) {
    const transactions = await investmentTransactionRepository.findByUserId(userId);

    let totalCapitalGain = 0;
    let totalDividends = 0;

    const details = [];

    for (const tx of transactions) {
      if (tx.type === 'SELL') {
        totalCapitalGain += tx.realizedPnl || 0;
        details.push({
          date: tx.date,
          type: 'SELL (Capital Gain/Loss)',
          assetId: tx.assetId,
          realizedPnl: tx.realizedPnl,
          amount: tx.totalAmount
        });
      } else if (tx.type === 'DIVIDEND') {
        totalDividends += tx.totalAmount || 0;
        details.push({
          date: tx.date,
          type: 'DIVIDEND',
          assetId: tx.assetId,
          amount: tx.totalAmount,
          taxDeduction: tx.taxDeduction
        });
      }
    }

    const totalRealizedReturn = totalCapitalGain + totalDividends;

    return {
      totalRealizedReturn: Number(totalRealizedReturn.toFixed(2)),
      totalCapitalGain: Number(totalCapitalGain.toFixed(2)),
      totalDividends: Number(totalDividends.toFixed(2)),
      details
    };
  }
}

module.exports = new DashboardService();
