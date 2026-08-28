const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class InvestmentTransactionRepository {
  get collection() {
    return getDb().collection('investment_transactions');
  }

  async findByUserId(userId, limit = 100) {
    return await this.collection
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }

  async create(data) {
    const document = {
      userId: new ObjectId(data.userId),
      rdnAccountId: new ObjectId(data.rdnAccountId),
      assetId: new ObjectId(data.assetId),
      type: data.type, // 'BUY' | 'SELL' | 'DIVIDEND'
      units: data.units || 0,
      pricePerUnit: data.pricePerUnit || 0,
      brokerFee: data.brokerFee || 0,
      taxDeduction: data.taxDeduction || 0,
      totalAmount: data.totalAmount,
      realizedPnl: data.realizedPnl || 0,
      date: data.date ? new Date(data.date) : new Date(),
      createdAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }
}

module.exports = new InvestmentTransactionRepository();
