const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const Member = require('../models/Member');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, addDays, getExpiryBucket } = require('../utils/dateUtils');

// @desc Main dashboard stats (top cards)
// @route GET /api/v1/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const gym = req.user.gym;
  const now = new Date();

  // "Active member" = account enabled AND their current membership status is 'active'
  const memberStatsAgg = await Member.aggregate([
    { $match: { gym, isActive: true } },
    {
      $lookup: {
        from: 'memberships',
        localField: 'currentMembership',
        foreignField: '_id',
        as: 'membership'
      }
    },
    { $unwind: { path: '$membership', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$membership.status', 'active'] }, 1, 0] } }
      }
    }
  ]);

  const totalMembers = memberStatsAgg[0] ? memberStatsAgg[0].total : 0;
  const activeMembers = memberStatsAgg[0] ? memberStatsAgg[0].active : 0;

  const [todayAttendanceCount, currentlyInGym, expiringSoonCount, expiredCount, pendingPaymentsCount, monthRevenueAgg] =
    await Promise.all([
      Attendance.countDocuments({ gym, checkIn: { $gte: startOfDay(now), $lte: endOfDay(now) } }),
      Attendance.countDocuments({ gym, checkOut: null }),
      Membership.countDocuments({ gym, status: 'active', expiryDate: { $lte: addDays(now, 7), $gte: now } }),
      Membership.countDocuments({ gym, status: 'expired' }),
      Membership.countDocuments({ gym, $expr: { $lt: ['$paidAmount', '$amount'] } }),
      Payment.aggregate([
        { $match: { gym, paymentDate: { $gte: startOfMonth(now), $lte: endOfMonth(now) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

  const thisMonthRevenue = monthRevenueAgg[0] ? monthRevenueAgg[0].total : 0;

  sendResponse(res, 200, 'Dashboard stats fetched successfully', {
    totalMembers,
    activeMembers,
    todayAttendance: todayAttendanceCount,
    currentlyInGym,
    expiringSoon: expiringSoonCount,
    expired: expiredCount,
    pendingPayments: pendingPaymentsCount,
    thisMonthRevenue
  });
});

// @desc "Action Required" widget: expired, expiring soon, pending payments, inactive/lapsed members
// @route GET /api/v1/dashboard/action-required
const getActionRequired = asyncHandler(async (req, res) => {
  const gym = req.user.gym;
  const now = new Date();

  const withBucket = (memberships) =>
    memberships.map((m) => ({ ...m.toObject(), expiryBucket: getExpiryBucket(m.expiryDate) }));

  const [expiredMemberships, expiringSoon, pendingPaymentMemberships, inactiveMembers] = await Promise.all([
    Membership.find({ gym, status: 'expired' }).populate('member', 'name mobile photo').sort({ expiryDate: -1 }).limit(50),
    Membership.find({ gym, status: 'active', expiryDate: { $lte: addDays(now, 7), $gte: now } })
      .populate('member', 'name mobile photo')
      .sort({ expiryDate: 1 })
      .limit(50),
    Membership.find({ gym, $expr: { $lt: ['$paidAmount', '$amount'] } })
      .populate('member', 'name mobile photo')
      .sort({ expiryDate: 1 })
      .limit(50),
    // Existing members (account active) whose membership has lapsed or was never assigned
    Member.aggregate([
      { $match: { gym, isActive: true } },
      {
        $lookup: {
          from: 'memberships',
          localField: 'currentMembership',
          foreignField: '_id',
          as: 'membership'
        }
      },
      { $unwind: { path: '$membership', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ membership: null }, { 'membership.status': 'expired' }] } },
      { $project: { name: 1, mobile: 1, photo: 1 } },
      { $limit: 50 }
    ])
  ]);

  sendResponse(res, 200, 'Action required list fetched', {
    expiredMemberships: withBucket(expiredMemberships),
    expiringSoon: withBucket(expiringSoon),
    pendingPayments: pendingPaymentMemberships.map((m) => ({
      ...m.toObject(),
      pendingAmount: m.amount - m.paidAmount
    })),
    inactiveMembers
  });
});

module.exports = { getDashboardStats, getActionRequired };
