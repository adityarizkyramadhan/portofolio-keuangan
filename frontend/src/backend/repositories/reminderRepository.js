const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class ReminderRepository {
  get collection() {
    return getDb().collection('reminders');
  }

  async findByUserId(userId) {
    return await this.collection
      .find({ userId: new ObjectId(userId) })
      .sort({ dueDate: 1 })
      .toArray();
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
      title: data.title,
      amount: Number(data.amount) || 0,
      dueDate: new Date(data.dueDate),
      status: data.status || 'PENDING', // 'PENDING' | 'PAID'
      walletId: data.walletId ? new ObjectId(data.walletId) : null,
      categoryId: data.categoryId ? new ObjectId(data.categoryId) : null,
      note: data.note || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async updateStatus(id, userId, status) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      {
        $set: { status, updatedAt: new Date() }
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

module.exports = new ReminderRepository();
