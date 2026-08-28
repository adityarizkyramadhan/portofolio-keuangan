const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => categoryController.getAll(req, res, next));
router.post('/', (req, res, next) => categoryController.create(req, res, next));
router.put('/:id/limit', (req, res, next) => categoryController.updateLimit(req, res, next));
router.delete('/:id', (req, res, next) => categoryController.delete(req, res, next));

module.exports = router;
