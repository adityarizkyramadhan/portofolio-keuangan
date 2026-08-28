const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => assetController.getAll(req, res, next));
router.get('/:id', (req, res, next) => assetController.getById(req, res, next));
router.post('/', (req, res, next) => assetController.create(req, res, next));
router.put('/:id/price', (req, res, next) => assetController.updatePrice(req, res, next));

module.exports = router;
