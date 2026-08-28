const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class CashTransactionRepository {
  get collection() {
    return getDb().collection('cash_transactions');
  }

  async findByUserId(userId, limit = 50) {
    return await this.collection
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }

  async create(data) {
    const document = {
      userId: new ObjectId(data.userId),
      accountId: new ObjectId(data.accountId),
      destinationAccountId: data.destinationAccountId ? new ObjectId(data.destinationAccountId) : null,
      categoryId: data.categoryId ? new ObjectId(data.categoryId) : null,
      type: data.type, // 'INCOME' | 'EXPENSE' | 'TRANSFER'
      amount: data.amount,
      note: data.note || '',
      date: data.date ? new Date(data.date) : new Date(),
      createdAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }
}

module.exports = new CashTransactionRepository();
