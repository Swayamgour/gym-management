const express = require('express');
const { getMembers, getMember, createMember, updateMember, deleteMember, scanQR } = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getMembers)
    .post(protect, authorize('owner', 'manager', 'receptionist'), createMember);

router.route('/qr-scan')
    .post(protect, scanQR);

router.route('/:id')
    .get(protect, getMember)
    .put(protect, authorize('owner', 'manager'), updateMember)
    .delete(protect, authorize('owner'), deleteMember);

module.exports = router;
