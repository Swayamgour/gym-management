const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  registerGymOwner,
  login,
  getMe,
  createStaff,
  listStaff,
  updateStaff,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('gymName').notEmpty().withMessage('Gym name is required'),
    body('name').notEmpty().withMessage('Owner name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  registerGymOwner
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, login);

router.get('/me', protect, getMe);

router.put(
  '/change-password',
  protect,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  changePassword
);

router.post(
  '/staff',
  protect,
  authorize('owner', 'manager'),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['manager', 'trainer', 'receptionist'])
  ],
  validate,
  createStaff
);

router.get('/staff', protect, authorize('owner', 'manager'), listStaff);
router.put('/staff/:id', protect, authorize('owner', 'manager'), updateStaff);

module.exports = router;
