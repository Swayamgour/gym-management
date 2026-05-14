const express = require('express');
const { getPlans, createPlan, updatePlan, deletePlan } = require('../controllers/planController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getPlans)
    .post(protect, authorize('owner', 'manager'), createPlan);

router.route('/:id')
    .put(protect, authorize('owner', 'manager'), updatePlan)
    .delete(protect, authorize('owner'), deletePlan);

module.exports = router;
