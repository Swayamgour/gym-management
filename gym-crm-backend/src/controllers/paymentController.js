const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const { getPagination, buildMeta } = require('../utils/pagination');

// @desc Record a payment against a membership
// @route POST /api/v1/payments
const recordPayment = asyncHandler(async (req, res) => {
  const { memberId, membershipId, amount, method, note, paymentDate } = req.body;

  const membership = await Membership.findOne({ _id: membershipId, gym: req.user.gym, member: memberId });
  if (!membership) throw new ApiError(404, 'Membership not found for this member');

  const pendingBefore = membership.amount - membership.paidAmount;
  if (Number(amount) > pendingBefore) {
    throw new ApiError(400, `Amount exceeds pending balance of ${pendingBefore}`);
  }

  const payment = await Payment.create({
    gym: req.user.gym,
    member: memberId,
    membership: membershipId,
    amount,
    method,
    note,
    paymentDate: paymentDate || new Date(),
    recordedBy: req.user._id
  });

  membership.paidAmount += Number(amount);
  await membership.save();

  sendResponse(res, 201, 'Payment recorded successfully', { payment, membership });
});

// @desc List payments with filters
// @route GET /api/v1/payments
const getPayments = asyncHandler(async (req, res) => {
  const { from, to, method, memberId } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { gym: req.user.gym };
  if (memberId) filter.member = memberId;
  if (method) filter.method = method;
  if (from || to) {
    filter.paymentDate = {};
    if (from) filter.paymentDate.$gte = new Date(from);
    if (to) filter.paymentDate.$lte = new Date(to);
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter).populate('member', 'name mobile').sort({ paymentDate: -1 }).skip(skip).limit(limit),
    Payment.countDocuments(filter)
  ]);

  sendResponse(res, 200, 'Payments fetched successfully', { payments }, buildMeta(total, page, limit));
});

// @desc List memberships that still have a pending balance
// @route GET /api/v1/payments/pending
const getPendingPayments = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    gym: req.user.gym,
    $expr: { $lt: ['$paidAmount', '$amount'] }
  })
    .populate('member', 'name mobile photo')
    .sort({ expiryDate: 1 });

  const pending = memberships.map((m) => ({
    membershipId: m._id,
    member: m.member,
    packageName: m.packageName,
    amount: m.amount,
    paidAmount: m.paidAmount,
    pendingAmount: m.amount - m.paidAmount
  }));

  sendResponse(res, 200, 'Pending payments fetched', { count: pending.length, pending });
});

// @desc Payments for a specific member
// @route GET /api/v1/payments/member/:memberId
const getMemberPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ gym: req.user.gym, member: req.params.memberId }).sort({ paymentDate: -1 });
  sendResponse(res, 200, 'Member payments fetched', { payments });
});

module.exports = { recordPayment, getPayments, getPendingPayments, getMemberPayments };
