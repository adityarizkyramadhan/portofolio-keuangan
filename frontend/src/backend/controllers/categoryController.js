const categoryService = require('../services/categoryService');

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getCategories(req.userId);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar kategori',
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id, req.userId);
      res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
