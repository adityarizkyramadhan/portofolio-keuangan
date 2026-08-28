const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class SimpleAssetRepository {
  get collection() {
    return getDb().collection('simple_assets');
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
      type: data.type || 'Saham', // Saham, Reksadana, Obligasi, Crypto, Lainnya
      totalValue: data.totalValue || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async updateValue(id, userId, newTotalValue) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(userId)
      },
      {
        $set: {
          totalValue: newTotalValue,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  async adjustValue(id, userId, amountChange) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(userId)
      },
      {
        $inc: { totalValue: amountChange },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }
}

module.exports = new SimpleAssetRepository();
