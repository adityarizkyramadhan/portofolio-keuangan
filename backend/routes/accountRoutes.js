const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => accountController.getAll(req, res, next));
router.get('/transactions', (req, res, next) => accountController.getTransactions(req, res, next));
router.get('/:id', (req, res, next) => accountController.getById(req, res, next));
router.post('/', (req, res, next) => accountController.create(req, res, next));
router.post('/transaction', (req, res, next) => accountController.recordTransaction(req, res, next));
router.post('/transfer', (req, res, next) => accountController.transfer(req, res, next));

module.exports = router;
