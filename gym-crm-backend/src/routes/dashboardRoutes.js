const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getDashboardStats, getActionRequired } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect, authorize('owner', 'manager'));

router.get('/', getDashboardStats);
router.get('/action-required', getActionRequired);

module.exports = router;
