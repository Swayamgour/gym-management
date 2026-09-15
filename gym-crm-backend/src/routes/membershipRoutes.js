const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { assignOrRenewMembership, getMemberships, getMembershipById } = require('../controllers/membershipController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('owner', 'manager', 'receptionist'),
  [body('memberId').notEmpty(), body('packageId').notEmpty()],
  validate,
  assignOrRenewMembership
);

router.get('/', authorize('owner', 'manager', 'receptionist'), getMemberships);
router.get('/:id', authorize('owner', 'manager', 'receptionist'), getMembershipById);

module.exports = router;
