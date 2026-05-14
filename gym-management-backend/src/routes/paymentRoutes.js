const express = require('express');
const { createPayment, getPayments, getPendingPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, authorize('owner', 'manager'), getPayments)
    .post(protect, authorize('owner', 'manager', 'receptionist'), createPayment);

router.get('/pending', protect, getPendingPayments);

module.exports = router;
