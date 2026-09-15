const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  assignTrainer,
  getMemberActivity
} = require('../controllers/memberController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('owner', 'manager', 'receptionist'),
  [body('name').notEmpty(), body('mobile').notEmpty()],
  validate,
  createMember
);

router.get('/', authorize('owner', 'manager', 'receptionist', 'trainer'), getMembers);
router.get('/:id', authorize('owner', 'manager', 'receptionist', 'trainer'), getMemberById);
router.get('/:id/activity', authorize('owner', 'manager', 'receptionist', 'trainer'), getMemberActivity);
router.put('/:id', authorize('owner', 'manager', 'receptionist'), updateMember);
router.put('/:id/trainer', authorize('owner', 'manager'), assignTrainer);
router.delete('/:id', authorize('owner', 'manager'), deleteMember);

module.exports = router;
