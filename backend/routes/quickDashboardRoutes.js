const express = require('express');
const router = express.Router();
const quickDashboardController = require('../controllers/quickDashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', (req, res, next) => quickDashboardController.getDashboard(req, res, next));

module.exports = router;
