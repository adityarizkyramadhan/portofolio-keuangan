const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => walletController.getAll(req, res, next));
router.get('/transactions', (req, res, next) => walletController.getTransactions(req, res, next));
router.post('/', (req, res, next) => walletController.create(req, res, next));
router.delete('/:id', (req, res, next) => walletController.delete(req, res, next));
router.post('/transaction', (req, res, next) => walletController.recordTransaction(req, res, next));
router.post('/transfer', (req, res, next) => walletController.transfer(req, res, next));

module.exports = router;
