const express = require('express');
const { getMemberProgress, addProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, addProgress);

router.get('/member/:memberId', protect, getMemberProgress);

module.exports = router;
