const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/buy', (req, res, next) => investmentController.buy(req, res, next));
router.post('/sell', (req, res, next) => investmentController.sell(req, res, next));
router.post('/dividend', (req, res, next) => investmentController.dividend(req, res, next));
router.get('/history', (req, res, next) => investmentController.getHistory(req, res, next));

module.exports = router;
