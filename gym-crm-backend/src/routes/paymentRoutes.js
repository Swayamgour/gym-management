const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  recordPayment,
  getPayments,
  getPendingPayments,
  getMemberPayments
} = require('../controllers/paymentController');

const router = express.Router();

router.use(protect, authorize('owner', 'manager', 'receptionist'));

router.post(
  '/',
  [body('memberId').notEmpty(), body('membershipId').notEmpty(), body('amount').isFloat({ gt: 0 })],
  validate,
  recordPayment
);
router.get('/', getPayments);
router.get('/pending', getPendingPayments);
router.get('/member/:memberId', getMemberPayments);

module.exports = router;
