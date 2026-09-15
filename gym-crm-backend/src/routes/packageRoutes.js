const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage
} = require('../controllers/packageController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('owner', 'manager'),
  [body('name').notEmpty(), body('durationInDays').isInt({ min: 1 }), body('price').isFloat({ min: 0 })],
  validate,
  createPackage
);

router.get('/', authorize('owner', 'manager', 'receptionist', 'trainer'), getPackages);
router.get('/:id', authorize('owner', 'manager', 'receptionist'), getPackageById);
router.put('/:id', authorize('owner', 'manager'), updatePackage);
router.delete('/:id', authorize('owner', 'manager'), deletePackage);

module.exports = router;
