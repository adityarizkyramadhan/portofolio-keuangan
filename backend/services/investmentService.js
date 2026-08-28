const accountRepository = require('../repositories/accountRepository');
const assetRepository = require('../repositories/assetRepository');
const holdingRepository = require('../repositories/holdingRepository');
const investmentTransactionRepository = require('../repositories/investmentTransactionRepository');

class InvestmentService {
  async buyAsset(userId, { rdnAccountId, assetId, units, pricePerUnit, brokerFee = 0, date }) {
    if (!rdnAccountId || !assetId || !units || units <= 0 || !pricePerUnit || pricePerUnit <= 0) {
      const err = new Error('RdnAccountId, assetId, units (>0), dan pricePerUnit (>0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const fee = Number(brokerFee) || 0;
    const grossTotal = units * pricePerUnit;
    const netTotal = grossTotal + fee;

    // 1. Check RDN Account
    const rdnAccount = await accountRepository.findById(rdnAccountId, userId);
    if (!rdnAccount) {
      const err = new Error('Akun RDN tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    if (rdnAccount.type !== 'RDN') {
      const err = new Error('Akun yang dipilih harus ber-tipe RDN');
      err.statusCode = 400;
      throw err;
    }
    if (rdnAccount.balance < netTotal) {
      const err = new Error(`Saldo RDN tidak mencukupi. Dibutuhkan: ${netTotal}, Tersedia: ${rdnAccount.balance}`);
      err.statusCode = 400;
      throw err;
    }

    // 2. Check Asset
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      const err = new Error('Aset investasi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    // 3. Deduct RDN Balance
    await accountRepository.updateBalance(rdnAccountId, -netTotal);

    // 4. Update Holding Aggregate Snapshot (Weighted Average Buy Price)
    const existingHolding = await holdingRepository.findByUserAndAsset(userId, assetId);
    let newTotalUnits = units;
    let newAverageBuyPrice = netTotal / units;

    if (existingHolding && existingHolding.totalUnits > 0) {
      const existingCost = existingHolding.totalUnits * existingHolding.averageBuyPrice;
      newTotalUnits = existingHolding.totalUnits + units;
      newAverageBuyPrice = (existingCost + netTotal) / newTotalUnits;
    }

    const updatedHolding = await holdingRepository.updateHolding(userId, assetId, newTotalUnits, newAverageBuyPrice);

    // 5. Record Mutation in InvestmentTransaction
    const transaction = await investmentTransactionRepository.create({
      userId,
      rdnAccountId,
      assetId,
      type: 'BUY',
      units,
      pricePerUnit,
      brokerFee: fee,
      totalAmount: netTotal,
      date
    });

    return {
      transaction,
      holding: updatedHolding,
      rdnBalance: rdnAccount.balance - netTotal
    };
  }

  async sellAsset(userId, { rdnAccountId, assetId, units, sellingPrice, brokerFee = 0, date }) {
    if (!rdnAccountId || !assetId || !units || units <= 0 || !sellingPrice || sellingPrice <= 0) {
      const err = new Error('RdnAccountId, assetId, units (>0), dan sellingPrice (>0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const fee = Number(brokerFee) || 0;
    const grossTotal = units * sellingPrice;
    const netProceeds = grossTotal - fee;

    // 1. Check RDN Account
    const rdnAccount = await accountRepository.findById(rdnAccountId, userId);
    if (!rdnAccount || rdnAccount.type !== 'RDN') {
      const err = new Error('Akun RDN tidak valid');
      err.statusCode = 400;
      throw err;
    }

    // 2. Check Holding
    const holding = await holdingRepository.findByUserAndAsset(userId, assetId);
    if (!holding || holding.totalUnits < units) {
      const available = holding ? holding.totalUnits : 0;
      const err = new Error(`Jumlah unit kepemilikan aset tidak mencukupi. Dijual: ${units}, Dimiliki: ${available}`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Calculate Realized PnL (Capital Gain/Loss)
    const costBasis = units * holding.averageBuyPrice;
    const realizedPnl = netProceeds - costBasis;

    // 4. Increase RDN Balance
    await accountRepository.updateBalance(rdnAccountId, netProceeds);

    // 5. Update Holding Snapshot
    const newTotalUnits = holding.totalUnits - units;
    const averageBuyPrice = newTotalUnits === 0 ? 0 : holding.averageBuyPrice;
    const updatedHolding = await holdingRepository.updateHolding(userId, assetId, newTotalUnits, averageBuyPrice);

    // 6. Record Investment Transaction
    const transaction = await investmentTransactionRepository.create({
      userId,
      rdnAccountId,
      assetId,
      type: 'SELL',
      units,
      pricePerUnit: sellingPrice,
      brokerFee: fee,
      totalAmount: netProceeds,
      realizedPnl,
      date
    });

    return {
      transaction,
      holding: updatedHolding,
      realizedPnl,
      rdnBalance: rdnAccount.balance + netProceeds
    };
  }

  async recordDividend(userId, { assetId, rdnAccountId, amountReceived, taxDeduction = 0, date }) {
    if (!assetId || !rdnAccountId || !amountReceived || amountReceived <= 0) {
      const err = new Error('AssetId, rdnAccountId, dan amountReceived (>0) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    const tax = Number(taxDeduction) || 0;
    const netDividend = amountReceived - tax;

    if (netDividend <= 0) {
      const err = new Error('Jumlah dividen bersih (amountReceived - taxDeduction) harus lebih besar dari 0');
      err.statusCode = 400;
      throw err;
    }

    // 1. Check RDN Account
    const rdnAccount = await accountRepository.findById(rdnAccountId, userId);
    if (!rdnAccount || rdnAccount.type !== 'RDN') {
      const err = new Error('Akun RDN tidak valid');
      err.statusCode = 400;
      throw err;
    }

    // 2. Check Asset
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      const err = new Error('Aset investasi tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    // 3. Add Net Dividend to RDN Balance
    await accountRepository.updateBalance(rdnAccountId, netDividend);

    // 4. Record Investment Transaction
    const transaction = await investmentTransactionRepository.create({
      userId,
      rdnAccountId,
      assetId,
      type: 'DIVIDEND',
      units: 0,
      pricePerUnit: 0,
      taxDeduction: tax,
      totalAmount: netDividend,
      realizedPnl: netDividend, // Dividend counts towards realized return
      date
    });

    return {
      transaction,
      rdnBalance: rdnAccount.balance + netDividend
    };
  }

  async getTransactionHistory(userId) {
    return await investmentTransactionRepository.findByUserId(userId);
  }
}

module.exports = new InvestmentService();
