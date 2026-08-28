const express = require('express');
const router = express.Router();
const simplePortfolioController = require('../controllers/simplePortfolioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => simplePortfolioController.getAssets(req, res, next));
router.post('/asset', (req, res, next) => simplePortfolioController.createAsset(req, res, next));
router.post('/buy-sell', (req, res, next) => simplePortfolioController.buyOrSell(req, res, next));
router.put('/asset/:id/value', (req, res, next) => simplePortfolioController.updateValue(req, res, next));

module.exports = router;
