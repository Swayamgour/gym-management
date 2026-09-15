const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getTrainers, getTrainerDashboard, getTrainerMembers } = require('../controllers/trainerController');

const router = express.Router();

router.use(protect);

router.get('/', authorize('owner', 'manager'), getTrainers);
router.get('/dashboard', authorize('trainer'), getTrainerDashboard);
router.get('/:trainerId/dashboard', authorize('owner', 'manager', 'trainer'), getTrainerDashboard);
router.get('/:trainerId/members', authorize('owner', 'manager', 'trainer'), getTrainerMembers);

module.exports = router;
