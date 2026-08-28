const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// GET /api/portfolios
router.get('/', (req, res, next) => portfolioController.getAll(req, res, next));

// GET /api/portfolios/:id
router.get('/:id', (req, res, next) => portfolioController.getById(req, res, next));

// POST /api/portfolios
router.post('/', (req, res, next) => portfolioController.create(req, res, next));

// PUT /api/portfolios/:id
router.put('/:id', (req, res, next) => portfolioController.update(req, res, next));

// DELETE /api/portfolios/:id
router.delete('/:id', (req, res, next) => portfolioController.delete(req, res, next));

module.exports = router;
