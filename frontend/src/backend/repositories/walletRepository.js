const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class WalletRepository {
  get collection() {
    return getDb().collection('accounts');
  }

  async findByUserId(userId) {
    return await this.collection.find({ userId: new ObjectId(userId) }).toArray();
  }

  async findById(id, userId) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });
  }

  async create(data) {
    const document = {
      userId: new ObjectId(data.userId),
      name: data.name,
      type: data.type, // 'BANK' | 'BANK_SAVINGS' | 'E_WALLET' | 'RDN' | 'CASH' | 'DEPOSITO' | 'CRYPTO_WALLET' | 'CREDIT_CARD' | 'OTHER'
      currency: data.currency || 'IDR', // 'IDR' | 'USD' | 'CNY' | 'MYR' | 'GBP' | 'SAR'
      institutionName: data.institutionName || '',
      accountNumber: data.accountNumber || '',
      balance: Number(data.balance) || 0,
      creditLimit: Number(data.creditLimit) || 0,
      remainingLimit: Number(data.remainingLimit) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async updateBalance(id, amountChange) {
    if (!ObjectId.isValid(id)) return null;
    const wallet = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!wallet) return null;

    const numChange = Number(amountChange) || 0;
    const incQuery = { balance: numChange };
    if (wallet.type === 'CREDIT_CARD' || wallet.remainingLimit !== undefined) {
      incQuery.remainingLimit = numChange;
    }

    return await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $inc: incQuery,
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  async updateBalanceAndLimit(id, newBalance, newRemainingLimit) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          balance: Number(newBalance) || 0,
          remainingLimit: Number(newRemainingLimit) || 0,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  async delete(id, userId) {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });
    return result.deletedCount > 0;
  }
}

module.exports = new WalletRepository();
