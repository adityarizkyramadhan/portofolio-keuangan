const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class AccountRepository {
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
      type: data.type, // 'CASH' | 'BANK' | 'E_WALLET' | 'RDN'
      institutionName: data.institutionName || '',
      accountNumber: data.accountNumber || '',
      balance: data.balance || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async updateBalance(id, amountChange) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $inc: { balance: amountChange },
        $set: { updatedAt: new Date() }
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

module.exports = new AccountRepository();
