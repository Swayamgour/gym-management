const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getSettings, updateSettings } = require('../controllers/settingsController');

const router = express.Router();

router.use(protect, authorize('owner'));

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
