const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  memberReport,
  attendanceReport,
  membershipReport,
  revenueReport,
  trainerReport
} = require('../controllers/reportController');

const router = express.Router();

router.use(protect, authorize('owner', 'manager'));

router.get('/members', memberReport);
router.get('/attendance', attendanceReport);
router.get('/memberships', membershipReport);
router.get('/revenue', revenueReport);
router.get('/trainers', trainerReport);

module.exports = router;
