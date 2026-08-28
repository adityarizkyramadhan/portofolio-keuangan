const portfolioRepository = require('../repositories/portfolioRepository');

class PortfolioService {
  async getAllPortfolios(filter) {
    return await portfolioRepository.findAll(filter);
  }

  async getPortfolioById(id) {
    const portfolio = await portfolioRepository.findById(id);
    if (!portfolio) {
      const error = new Error(`Portfolio dengan ID ${id} tidak ditemukan`);
      error.statusCode = 404;
      throw error;
    }
    return portfolio;
  }

  async createPortfolio(data) {
    if (!data.name || typeof data.name !== 'string') {
      const error = new Error('Nama portofolio wajib diisi');
      error.statusCode = 400;
      throw error;
    }

    if (data.amount !== undefined && (typeof data.amount !== 'number' || data.amount < 0)) {
      const error = new Error('Jumlah portofolio harus berupa angka positif');
      error.statusCode = 400;
      throw error;
    }

    const payload = {
      name: data.name.trim(),
      type: data.type || 'Tabungan',
      amount: data.amount || 0,
      currency: data.currency || 'IDR',
      description: data.description || ''
    };

    return await portfolioRepository.create(payload);
  }

  async updatePortfolio(id, data) {
    await this.getPortfolioById(id); // Check existence

    if (data.amount !== undefined && (typeof data.amount !== 'number' || data.amount < 0)) {
      const error = new Error('Jumlah portofolio harus berupa angka positif');
      error.statusCode = 400;
      throw error;
    }

    const payload = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.type !== undefined) payload.type = data.type;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.currency !== undefined) payload.currency = data.currency;
    if (data.description !== undefined) payload.description = data.description;

    return await portfolioRepository.update(id, payload);
  }

  async deletePortfolio(id) {
    await this.getPortfolioById(id); // Check existence
    return await portfolioRepository.delete(id);
  }
}

module.exports = new PortfolioService();
