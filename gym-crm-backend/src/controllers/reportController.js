const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const Member = require('../models/Member');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const { startOfDay, endOfDay, startOfMonth, endOfMonth } = require('../utils/dateUtils');

// @desc Member report: totals, active, expired, new this month
// @route GET /api/v1/reports/members
const memberReport = asyncHandler(async (req, res) => {
  const gym = req.user.gym;
  const now = new Date();

  const [total, active, expiredMembershipCount, newThisMonth] = await Promise.all([
    Member.countDocuments({ gym }),
    Member.countDocuments({ gym, isActive: true }),
    Membership.countDocuments({ gym, status: 'expired' }),
    Member.countDocuments({ gym, joiningDate: { $gte: startOfMonth(now), $lte: endOfMonth(now) } })
  ]);

  sendResponse(res, 200, 'Member report generated', {
    totalMembers: total,
    activeMembers: active,
    expiredMemberships: expiredMembershipCount,
    newMembersThisMonth: newThisMonth
  });
});

// @desc Attendance report: today's count, monthly trend, member-wise totals
// @route GET /api/v1/reports/attendance
const attendanceReport = asyncHandler(async (req, res) => {
  const gym = req.user.gym;
  const { from, to, memberId } = req.query;
  const now = new Date();

  const rangeFilter = { gym };
  if (memberId) rangeFilter.member = memberId;
  if (from || to) {
    rangeFilter.checkIn = {};
    if (from) rangeFilter.checkIn.$gte = new Date(from);
    if (to) rangeFilter.checkIn.$lte = new Date(to);
  }

  const [todayCount, monthlyGrouped, memberWise] = await Promise.all([
    Attendance.countDocuments({ gym, checkIn: { $gte: startOfDay(now), $lte: endOfDay(now) } }),
    Attendance.aggregate([
      { $match: { gym, checkIn: { $gte: startOfMonth(now), $lte: endOfMonth(now) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Attendance.aggregate([
      { $match: rangeFilter },
      { $group: { _id: '$member', visits: { $sum: 1 } } },
      { $lookup: { from: 'members', localField: '_id', foreignField: '_id', as: 'member' } },
      { $unwind: '$member' },
      { $project: { visits: 1, 'member.name': 1, 'member.mobile': 1 } },
      { $sort: { visits: -1 } }
    ])
  ]);

  sendResponse(res, 200, 'Attendance report generated', {
    todaysAttendance: todayCount,
    monthlyAttendance: monthlyGrouped,
    memberWiseAttendance: memberWise
  });
});

// @desc Membership report: expiring, expired, renewed
// @route GET /api/v1/reports/memberships
const membershipReport = asyncHandler(async (req, res) => {
  const gym = req.user.gym;
  const { from, to } = req.query;
  const now = new Date();

  const renewalFilter = { gym, isRenewal: true };
  if (from || to) {
    renewalFilter.createdAt = {};
    if (from) renewalFilter.createdAt.$gte = new Date(from);
    if (to) renewalFilter.createdAt.$lte = new Date(to);
  } else {
    renewalFilter.createdAt = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
  }

  const [expiring, expired, renewed] = await Promise.all([
    Membership.countDocuments({ gym, status: 'active', expiryDate: { $gte: now } }),
    Membership.countDocuments({ gym, status: 'expired' }),
    Membership.countDocuments(renewalFilter)
  ]);

  sendResponse(res, 200, 'Membership report generated', { expiring, expired, renewed });
});

// @desc Revenue report: daily breakdown, total, pending
// @route GET /api/v1/reports/revenue
const revenueReport = asyncHandler(async (req, res) => {
  const gym = req.user.gym;
  const { from, to } = req.query;
  const now = new Date();

  const filter = { gym };
  filter.paymentDate = {
    $gte: from ? new Date(from) : startOfMonth(now),
    $lte: to ? new Date(to) : endOfMonth(now)
  };

  const [daily, monthlyTotal, pendingAgg] = await Promise.all([
    Payment.aggregate([
      { $match: filter },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]),
    Payment.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Membership.aggregate([
      { $match: { gym, $expr: { $lt: ['$paidAmount', '$amount'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$paidAmount'] } } } }
    ])
  ]);

  sendResponse(res, 200, 'Revenue report generated', {
    dailyRevenue: daily,
    totalRevenue: monthlyTotal[0] ? monthlyTotal[0].total : 0,
    pendingAmount: pendingAgg[0] ? pendingAgg[0].total : 0
  });
});

// @desc Trainer report: trainer-wise member counts, unassigned members
// @route GET /api/v1/reports/trainers
const trainerReport = asyncHandler(async (req, res) => {
  const gym = req.user.gym;

  const [trainerWise, unassigned] = await Promise.all([
    Member.aggregate([
      { $match: { gym, trainer: { $ne: null } } },
      { $group: { _id: '$trainer', memberCount: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'trainer' } },
      { $unwind: '$trainer' },
      { $project: { memberCount: 1, 'trainer.name': 1, 'trainer.phone': 1 } },
      { $sort: { memberCount: -1 } }
    ]),
    Member.countDocuments({ gym, trainer: null })
  ]);

  sendResponse(res, 200, 'Trainer report generated', { trainerWiseMembers: trainerWise, unassignedMembers: unassigned });
});

module.exports = { memberReport, attendanceReport, membershipReport, revenueReport, trainerReport };
