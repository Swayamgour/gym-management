const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Member = require('../models/Member');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getPagination, buildMeta } = require('../utils/pagination');
const { getExpiryBucket } = require('../utils/dateUtils');

// Trainers can only ever see/manage members assigned to them
const scopeFilterForRole = (req) => {
  const filter = { gym: req.user.gym };
  if (req.user.role === 'trainer') {
    filter.trainer = req.user._id;
  }
  return filter;
};

function buildActivityFeed(memberships, attendanceRecords, payments) {
  const events = [];

  memberships.forEach((m) => {
    events.push({
      type: m.isRenewal ? 'membership_renewed' : 'membership_created',
      date: m.startDate,
      description: `${m.isRenewal ? 'Renewed' : 'Purchased'} ${m.packageName} package`
    });
  });

  attendanceRecords.forEach((a) => {
    events.push({ type: 'check_in', date: a.checkIn, description: 'Checked in' });
    if (a.checkOut) {
      events.push({ type: 'check_out', date: a.checkOut, description: 'Checked out' });
    }
  });

  payments.forEach((p) => {
    events.push({ type: 'payment', date: p.paymentDate, description: `Payment received: Rs.${p.amount}` });
  });

  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// @desc Create member
// @route POST /api/v1/members
const createMember = asyncHandler(async (req, res) => {
  const { name, photo, mobile, email, dob, gender, address, joiningDate, emergencyContact, trainer } = req.body;

  if (trainer) {
    const trainerUser = await User.findOne({ _id: trainer, gym: req.user.gym, role: 'trainer' });
    if (!trainerUser) throw new ApiError(400, 'Invalid trainer selected');
  }

  const member = await Member.create({
    gym: req.user.gym,
    name,
    photo,
    mobile,
    email,
    dob,
    gender,
    address,
    joiningDate,
    emergencyContact,
    trainer: trainer || null
  });

  sendResponse(res, 201, 'Member created successfully', { member });
});

// @desc Get members list with search, filters, pagination
// @route GET /api/v1/members
const getMembers = asyncHandler(async (req, res) => {
  const { search, trainer, membershipStatus } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const match = scopeFilterForRole(req);
  if (trainer) match.trainer = new mongoose.Types.ObjectId(trainer);
  if (search) {
    match.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const pipeline = [
    { $match: match },
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
      $lookup: {
        from: 'users',
        localField: 'trainer',
        foreignField: '_id',
        as: 'trainerInfo'
      }
    },
    { $unwind: { path: '$trainerInfo', preserveNullAndEmptyArrays: true } }
  ];

  if (membershipStatus) {
    if (membershipStatus === 'no_membership') {
      pipeline.push({ $match: { membership: { $eq: null } } });
    } else {
      pipeline.push({ $match: { 'membership.status': membershipStatus } });
    }
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              photo: 1,
              mobile: 1,
              email: 1,
              gender: 1,
              joiningDate: 1,
              isActive: 1,
              createdAt: 1,
              trainer: {
                $cond: [
                  { $ifNull: ['$trainerInfo._id', false] },
                  { _id: '$trainerInfo._id', name: '$trainerInfo.name' },
                  null
                ]
              },
              membership: {
                $cond: [
                  { $ifNull: ['$membership._id', false] },
                  {
                    packageName: '$membership.packageName',
                    startDate: '$membership.startDate',
                    expiryDate: '$membership.expiryDate',
                    amount: '$membership.amount',
                    paidAmount: '$membership.paidAmount',
                    status: '$membership.status'
                  },
                  null
                ]
              }
            }
          }
        ],
        totalCount: [{ $count: 'count' }]
      }
    }
  );

  const result = await Member.aggregate(pipeline);
  const data = result[0].data;
  const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

  sendResponse(res, 200, 'Members fetched successfully', { members: data }, buildMeta(total, page, limit));
});

// @desc Get single member full profile (all tabs: overview, membership, attendance, payments, trainer, activity)
// @route GET /api/v1/members/:id
const getMemberById = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, gym: req.user.gym };
  if (req.user.role === 'trainer') filter.trainer = req.user._id;

  const member = await Member.findOne(filter)
    .populate('trainer', 'name phone email specialization')
    .populate('currentMembership');

  if (!member) throw new ApiError(404, 'Member not found');

  const [memberships, payments, attendanceRecords, lastAttendance, totalVisits] = await Promise.all([
    Membership.find({ member: member._id }).sort({ startDate: -1 }),
    Payment.find({ member: member._id }).sort({ paymentDate: -1 }),
    Attendance.find({ member: member._id }).sort({ checkIn: -1 }).limit(30),
    Attendance.findOne({ member: member._id }).sort({ checkIn: -1 }),
    Attendance.countDocuments({ member: member._id })
  ]);

  let membershipInfo = null;
  if (member.currentMembership) {
    membershipInfo = {
      ...member.currentMembership.toObject(),
      expiryBucket: getExpiryBucket(member.currentMembership.expiryDate)
    };
  }

  sendResponse(res, 200, 'Member profile fetched', {
    overview: {
      member,
      currentMembership: membershipInfo,
      totalVisits,
      lastVisit: lastAttendance
    },
    membership: { current: membershipInfo, history: memberships },
    attendance: attendanceRecords,
    payments,
    trainer: member.trainer,
    activity: buildActivityFeed(memberships, attendanceRecords, payments)
  });
});

// @desc Update member
// @route PUT /api/v1/members/:id
const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!member) throw new ApiError(404, 'Member not found');

  const allowedFields = ['name', 'photo', 'mobile', 'email', 'dob', 'gender', 'address', 'emergencyContact', 'isActive'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) member[field] = req.body[field];
  });

  await member.save();
  sendResponse(res, 200, 'Member updated successfully', { member });
});

// @desc Soft delete (deactivate) member
// @route DELETE /api/v1/members/:id
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!member) throw new ApiError(404, 'Member not found');

  member.isActive = false;
  await member.save();

  sendResponse(res, 200, 'Member deactivated successfully');
});

// @desc Assign or change trainer (or unassign with trainerId=null)
// @route PUT /api/v1/members/:id/trainer
const assignTrainer = asyncHandler(async (req, res) => {
  const { trainerId } = req.body;

  const member = await Member.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!member) throw new ApiError(404, 'Member not found');

  if (trainerId) {
    const trainerUser = await User.findOne({ _id: trainerId, gym: req.user.gym, role: 'trainer', isActive: true });
    if (!trainerUser) throw new ApiError(400, 'Invalid trainer selected');
    member.trainer = trainerUser._id;
  } else {
    member.trainer = null;
  }

  await member.save();
  sendResponse(res, 200, 'Trainer assignment updated', { member });
});

// @desc Get member activity feed (check-ins, payments, membership changes)
// @route GET /api/v1/members/:id/activity
const getMemberActivity = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!member) throw new ApiError(404, 'Member not found');

  const [memberships, attendanceRecords, payments] = await Promise.all([
    Membership.find({ member: member._id }).sort({ startDate: -1 }),
    Attendance.find({ member: member._id }).sort({ checkIn: -1 }).limit(50),
    Payment.find({ member: member._id }).sort({ paymentDate: -1 })
  ]);

  sendResponse(res, 200, 'Activity fetched', { activity: buildActivityFeed(memberships, attendanceRecords, payments) });
});

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  assignTrainer,
  getMemberActivity
};
