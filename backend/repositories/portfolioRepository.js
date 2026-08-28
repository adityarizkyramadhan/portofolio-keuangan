const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class PortfolioRepository {
  get collection() {
    return getDb().collection('portfolios');
  }

  async findAll(filter = {}) {
    return await this.collection.find(filter).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(data) {
    const document = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async update(id, data) {
    if (!ObjectId.isValid(id)) return null;
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

module.exports = new PortfolioRepository();
