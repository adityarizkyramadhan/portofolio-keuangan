const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
  async getCategories(userId) {
    return await categoryRepository.findByUserId(userId);
  }

  async createCategory(userId, { name, type, icon }) {
    if (!name || !type) {
      const err = new Error('Nama dan tipe kategori (INCOME / EXPENSE) wajib diisi');
      err.statusCode = 400;
      throw err;
    }

    if (!['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      const err = new Error('Tipe kategori harus INCOME atau EXPENSE');
      err.statusCode = 400;
      throw err;
    }

    return await categoryRepository.create({
      userId,
      name: name.trim(),
      type: type.toUpperCase(),
      icon
    });
  }

  async deleteCategory(id, userId) {
    const deleted = await categoryRepository.delete(id, userId);
    if (!deleted) {
      const err = new Error('Kategori tidak ditemukan atau tidak dapat dihapus');
      err.statusCode = 404;
      throw err;
    }
    return true;
  }
}

module.exports = new CategoryService();
