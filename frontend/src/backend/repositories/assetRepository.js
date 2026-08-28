const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class AssetRepository {
  get collection() {
    return getDb().collection('assets');
  }

  async findAll(filter = {}) {
    return await this.collection.find(filter).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async findByCode(assetCode) {
    return await this.collection.findOne({ assetCode: assetCode.toUpperCase() });
  }

  async create(data) {
    const document = {
      assetCode: data.assetCode.toUpperCase(),
      assetName: data.assetName,
      assetType: data.assetType, // 'SAHAM' | 'REKSADANA' | 'OBLIGASI' | 'CRYPTO'
      currentPrice: data.currentPrice || 0,
      lastPriceUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async updatePrice(id, currentPrice) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          currentPrice,
          lastPriceUpdate: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
}

module.exports = new AssetRepository();
