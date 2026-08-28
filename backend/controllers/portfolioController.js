const portfolioService = require('../services/portfolioService');
const logger = require('../utils/logger');

class PortfolioController {
  async getAll(req, res, next) {
    try {
      const portfolios = await portfolioService.getAllPortfolios(req.query);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil daftar portofolio',
        data: portfolios
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const portfolio = await portfolioService.getPortfolioById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil detail portofolio',
        data: portfolio
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newPortfolio = await portfolioService.createPortfolio(req.body);
      logger.info('Portofolio baru berhasil dibuat', { context: 'PortfolioController', id: newPortfolio._id });
      res.status(201).json({
        success: true,
        message: 'Portofolio berhasil dibuat',
        data: newPortfolio
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedPortfolio = await portfolioService.updatePortfolio(req.params.id, req.body);
      logger.info('Portofolio berhasil diperbarui', { context: 'PortfolioController', id: req.params.id });
      res.status(200).json({
        success: true,
        message: 'Portofolio berhasil diperbarui',
        data: updatedPortfolio
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await portfolioService.deletePortfolio(req.params.id);
      logger.info('Portofolio berhasil dihapus', { context: 'PortfolioController', id: req.params.id });
      res.status(200).json({
        success: true,
        message: 'Portofolio berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PortfolioController();
