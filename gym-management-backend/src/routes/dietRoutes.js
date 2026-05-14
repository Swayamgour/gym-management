const express = require('express');
const { getMemberDiets, createDiet, updateDiet } = require('../controllers/dietController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, createDiet);

router.get('/member/:memberId', protect, getMemberDiets);

router.route('/:id')
    .put(protect, updateDiet);

module.exports = router;
