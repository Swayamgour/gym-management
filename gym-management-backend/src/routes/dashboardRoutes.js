const express = require('express');
const { getStats, getRevenueChart } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, authorize('owner', 'manager'), getStats);
router.get('/revenue-chart', protect, authorize('owner', 'manager'), getRevenueChart);

module.exports = router;
