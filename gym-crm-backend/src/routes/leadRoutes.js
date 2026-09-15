const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  convertLeadToMember,
  deleteLead
} = require('../controllers/leadController');

const router = express.Router();

router.use(protect, authorize('owner', 'manager', 'receptionist'));

router.post('/', [body('name').notEmpty(), body('mobile').notEmpty()], validate, createLead);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.post('/:id/convert', convertLeadToMember);
router.delete('/:id', deleteLead);

module.exports = router;
