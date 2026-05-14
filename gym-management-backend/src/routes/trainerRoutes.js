const express = require('express');
const { getTrainers, getTrainer, createTrainer, updateTrainer } = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getTrainers)
    .post(protect, authorize('owner', 'manager'), createTrainer);

router.route('/:id')
    .get(protect, getTrainer)
    .put(protect, authorize('owner', 'manager'), updateTrainer);

module.exports = router;
