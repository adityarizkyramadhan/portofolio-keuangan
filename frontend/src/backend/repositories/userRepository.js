const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class UserRepository {
  get collection() {
    return getDb().collection('users');
  }

  async findByEmail(email) {
    return await this.collection.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(user) {
    const document = {
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(document);
    return { _id: result.insertedId, name: document.name, email: document.email, createdAt: document.createdAt };
  }
}

module.exports = new UserRepository();
