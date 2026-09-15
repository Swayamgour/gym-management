const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const User = require('../models/User');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const { startOfDay, endOfDay } = require('../utils/dateUtils');

// @desc List all trainers with their current member count
// @route GET /api/v1/trainers
const getTrainers = asyncHandler(async (req, res) => {
  const trainers = await User.find({ gym: req.user.gym, role: 'trainer' }).sort({ name: 1 });

  const trainersWithCounts = await Promise.all(
    trainers.map(async (trainer) => {
      const memberCount = await Member.countDocuments({ gym: req.user.gym, trainer: trainer._id, isActive: true });
      return { ...trainer.toObject(), memberCount };
    })
  );

  sendResponse(res, 200, 'Trainers fetched successfully', { trainers: trainersWithCounts });
});

// @desc Trainer dashboard: my members, today's members, today's sessions
// @route GET /api/v1/trainers/dashboard  (self)
// @route GET /api/v1/trainers/:trainerId/dashboard (owner/manager viewing a trainer)
const getTrainerDashboard = asyncHandler(async (req, res) => {
  const trainerId = req.params.trainerId || req.user._id;

  if (req.user.role === 'trainer' && String(trainerId) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only view your own dashboard');
  }

  const myMembers = await Member.find({ gym: req.user.gym, trainer: trainerId, isActive: true }).select(
    'name mobile photo currentMembership'
  );
  const memberIds = myMembers.map((m) => m._id);

  const [todayMemberIds, todaySessions] = await Promise.all([
    Attendance.distinct('member', {
      gym: req.user.gym,
      member: { $in: memberIds },
      checkIn: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) }
    }),
    Attendance.countDocuments({
      gym: req.user.gym,
      member: { $in: memberIds },
      checkIn: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) }
    })
  ]);

  sendResponse(res, 200, 'Trainer dashboard fetched', {
    myMembersCount: myMembers.length,
    todaysMembersCount: todayMemberIds.length,
    todaysSessions: todaySessions,
    myMembers
  });
});

// @desc Members assigned to a given trainer
// @route GET /api/v1/trainers/:trainerId/members
const getTrainerMembers = asyncHandler(async (req, res) => {
  const trainerId = req.params.trainerId;

  if (req.user.role === 'trainer' && String(trainerId) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only view your own members');
  }

  const members = await Member.find({ gym: req.user.gym, trainer: trainerId })
    .populate('currentMembership', 'packageName expiryDate status')
    .sort({ name: 1 });

  sendResponse(res, 200, "Trainer's members fetched", { members });
});

module.exports = { getTrainers, getTrainerDashboard, getTrainerMembers };
