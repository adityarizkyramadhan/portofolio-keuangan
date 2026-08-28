const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/summary', (req, res, next) => dashboardController.getSummary(req, res, next));
router.get('/holdings', (req, res, next) => dashboardController.getHoldings(req, res, next));
router.get('/allocation', (req, res, next) => dashboardController.getAllocation(req, res, next));
router.get('/realized-returns', (req, res, next) => dashboardController.getRealizedReturns(req, res, next));

module.exports = router;
