const express = require('express');
const { getMemberWorkouts, createWorkout, updateWorkout } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, createWorkout);

router.get('/member/:memberId', protect, getMemberWorkouts);

router.route('/:id')
    .put(protect, updateWorkout);

module.exports = router;
