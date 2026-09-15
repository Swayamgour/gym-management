const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { startOfDay, endOfDay } = require('../utils/dateUtils');

// @desc Check-in a member
// @route POST /api/v1/attendance/check-in
const checkIn = asyncHandler(async (req, res) => {
  const { memberId } = req.body;

  const member = await Member.findOne({ _id: memberId, gym: req.user.gym });
  if (!member) throw new ApiError(404, 'Member not found');

  const openSession = await Attendance.findOne({ member: member._id, checkOut: null });
  if (openSession) {
    throw new ApiError(409, 'Member is already checked in');
  }

  const now = new Date();
  const attendance = await Attendance.create({
    gym: req.user.gym,
    member: member._id,
    date: startOfDay(now),
    checkIn: now,
    markedBy: req.user._id
  });

  sendResponse(res, 201, 'Member checked in successfully', { attendance });
});

// @desc Check-out a member
// @route POST /api/v1/attendance/check-out
const checkOut = asyncHandler(async (req, res) => {
  const { memberId } = req.body;

  const attendance = await Attendance.findOne({
    gym: req.user.gym,
    member: memberId,
    checkOut: null
  }).sort({ checkIn: -1 });

  if (!attendance) throw new ApiError(404, 'No active check-in found for this member');

  attendance.checkOut = new Date();
  attendance.durationMinutes = Math.round((attendance.checkOut - attendance.checkIn) / 60000);
  await attendance.save();

  sendResponse(res, 200, 'Member checked out successfully', { attendance });
});

// @desc Members currently inside the gym
// @route GET /api/v1/attendance/currently-inside
const getCurrentlyInside = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ gym: req.user.gym, checkOut: null })
    .populate('member', 'name mobile photo')
    .sort({ checkIn: 1 });

  sendResponse(res, 200, 'Currently inside members fetched', { count: records.length, records });
});

// @desc Today's attendance list
// @route GET /api/v1/attendance/today
const getTodayAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({
    gym: req.user.gym,
    checkIn: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) }
  })
    .populate('member', 'name mobile photo')
    .sort({ checkIn: -1 });

  sendResponse(res, 200, "Today's attendance fetched", { count: records.length, records });
});

// @desc Attendance history for a specific member
// @route GET /api/v1/attendance/member/:memberId
const getMemberAttendance = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { gym: req.user.gym, member: req.params.memberId };

  if (from || to) {
    filter.checkIn = {};
    if (from) filter.checkIn.$gte = new Date(from);
    if (to) filter.checkIn.$lte = new Date(to);
  }

  const records = await Attendance.find(filter).sort({ checkIn: -1 });
  sendResponse(res, 200, 'Member attendance fetched', { records });
});

module.exports = { checkIn, checkOut, getCurrentlyInside, getTodayAttendance, getMemberAttendance };
