const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class HoldingRepository {
  get collection() {
    return getDb().collection('holdings');
  }

  async findByUserId(userId) {
    return await this.collection.find({ userId: new ObjectId(userId) }).toArray();
  }

  async findByUserAndAsset(userId, assetId) {
    if (!ObjectId.isValid(assetId)) return null;
    return await this.collection.findOne({
      userId: new ObjectId(userId),
      assetId: new ObjectId(assetId)
    });
  }

  async updateHolding(userId, assetId, totalUnits, averageBuyPrice) {
    return await this.collection.findOneAndUpdate(
      {
        userId: new ObjectId(userId),
        assetId: new ObjectId(assetId)
      },
      {
        $set: {
          totalUnits,
          averageBuyPrice,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
  }
}

module.exports = new HoldingRepository();
