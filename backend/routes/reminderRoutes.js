const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => reminderController.getAll(req, res, next));
router.post('/', (req, res, next) => reminderController.create(req, res, next));
router.put('/:id/pay', (req, res, next) => reminderController.markAsPaid(req, res, next));
router.delete('/:id', (req, res, next) => reminderController.delete(req, res, next));

module.exports = router;
