const express = require('express');
const { checkIn, checkOut, getTodayAttendance, getMemberAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/checkin', protect, checkIn);
router.put('/checkout/:id', protect, checkOut);
router.get('/today', protect, getTodayAttendance);
router.get('/member/:memberId', protect, getMemberAttendance);

module.exports = router;
