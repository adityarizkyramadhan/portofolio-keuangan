const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class CategoryRepository {
  get collection() {
    return getDb().collection('categories');
  }

  async findByUserId(userId) {
    return await this.collection.find({
      $or: [
        { userId: new ObjectId(userId) },
        { isSystem: true }
      ]
    }).toArray();
  }

  async findById(id, userId) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOne({
      _id: new ObjectId(id),
      $or: [
        { userId: new ObjectId(userId) },
        { isSystem: true }
      ]
    });
  }

  async create(data) {
    const document = {
      userId: new ObjectId(data.userId),
      name: data.name,
      type: data.type, // 'INCOME' | 'EXPENSE'
      icon: data.icon || 'default',
      isSystem: false,
      createdAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async delete(id, userId) {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
      isSystem: { $ne: true }
    });
    return result.deletedCount > 0;
  }
}

module.exports = new CategoryRepository();
