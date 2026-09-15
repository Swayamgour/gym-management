const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  checkIn,
  checkOut,
  getCurrentlyInside,
  getTodayAttendance,
  getMemberAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

router.use(protect, authorize('owner', 'manager', 'receptionist', 'trainer'));

router.post('/check-in', [body('memberId').notEmpty()], validate, checkIn);
router.post('/check-out', [body('memberId').notEmpty()], validate, checkOut);
router.get('/currently-inside', getCurrentlyInside);
router.get('/today', getTodayAttendance);
router.get('/member/:memberId', getMemberAttendance);

module.exports = router;
