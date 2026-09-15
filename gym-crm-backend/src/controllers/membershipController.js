const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Membership = require('../models/Membership');
const Member = require('../models/Member');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const FollowUp = require('../models/FollowUp');
const { addDays, getExpiryBucket } = require('../utils/dateUtils');
const { getPagination, buildMeta } = require('../utils/pagination');
const { DEFAULT_TEMPLATES, fillTemplate } = require('../utils/whatsapp');

// @desc Assign a new package / renew membership for a member
// @route POST /api/v1/memberships
const assignOrRenewMembership = asyncHandler(async (req, res) => {
  const { memberId, packageId, startDate, amount, initialPayment, paymentMethod } = req.body;

  const member = await Member.findOne({ _id: memberId, gym: req.user.gym });
  if (!member) throw new ApiError(404, 'Member not found');

  const pkg = await Package.findOne({ _id: packageId, gym: req.user.gym });
  if (!pkg) throw new ApiError(404, 'Package not found');

  const isRenewal = Boolean(member.currentMembership);
  const effectiveStart = startDate ? new Date(startDate) : new Date();
  const expiryDate = addDays(effectiveStart, pkg.durationInDays);
  const finalAmount = amount !== undefined ? amount : pkg.price;

  const membership = await Membership.create({
    gym: req.user.gym,
    member: member._id,
    package: pkg._id,
    packageName: pkg.name,
    durationInDays: pkg.durationInDays,
    startDate: effectiveStart,
    expiryDate,
    amount: finalAmount,
    paidAmount: 0,
    isRenewal,
    createdBy: req.user._id
  });

  if (initialPayment && Number(initialPayment) > 0) {
    await Payment.create({
      gym: req.user.gym,
      member: member._id,
      membership: membership._id,
      amount: Number(initialPayment),
      method: paymentMethod || 'cash',
      recordedBy: req.user._id
    });
    membership.paidAmount = Number(initialPayment);
    await membership.save();
  }

  member.currentMembership = membership._id;
  member.isActive = true;
  await member.save();

  // Auto-generate a welcome/renewal WhatsApp message for the owner to send
  const templateType = isRenewal ? 'renewal' : 'welcome';
  const message = fillTemplate(DEFAULT_TEMPLATES[templateType], { name: member.name });
  await FollowUp.create({
    gym: req.user.gym,
    member: member._id,
    channel: 'whatsapp',
    messageType: templateType,
    message,
    status: 'generated',
    sentBy: req.user._id
  });

  sendResponse(res, 201, isRenewal ? 'Membership renewed successfully' : 'Membership assigned successfully', {
    membership,
    suggestedMessage: message
  });
});

// @desc List memberships with status filter and expiry buckets (used by Memberships module)
// @route GET /api/v1/memberships
const getMemberships = asyncHandler(async (req, res) => {
  const { status, withinDays } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { gym: req.user.gym };
  if (status) filter.status = status;
  if (withinDays) {
    filter.status = 'active';
    filter.expiryDate = { $lte: addDays(new Date(), Number(withinDays)) };
  }

  const [memberships, total] = await Promise.all([
    Membership.find(filter)
      .populate('member', 'name mobile email photo')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(limit),
    Membership.countDocuments(filter)
  ]);

  const withBuckets = memberships.map((m) => ({
    ...m.toObject(),
    expiryBucket: getExpiryBucket(m.expiryDate)
  }));

  sendResponse(res, 200, 'Memberships fetched successfully', { memberships: withBuckets }, buildMeta(total, page, limit));
});

// @desc Get single membership
// @route GET /api/v1/memberships/:id
const getMembershipById = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({ _id: req.params.id, gym: req.user.gym }).populate(
    'member',
    'name mobile email'
  );
  if (!membership) throw new ApiError(404, 'Membership not found');
  sendResponse(res, 200, 'Membership fetched', { membership });
});

module.exports = { assignOrRenewMembership, getMemberships, getMembershipById };
