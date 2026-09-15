const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Gym = require('../models/Gym');

// @desc Get gym settings/profile
// @route GET /api/v1/settings
const getSettings = asyncHandler(async (req, res) => {
  const gym = await Gym.findById(req.user.gym);
  if (!gym) throw new ApiError(404, 'Gym not found');
  sendResponse(res, 200, 'Settings fetched successfully', { gym });
});

// @desc Update gym settings/profile
// @route PUT /api/v1/settings
const updateSettings = asyncHandler(async (req, res) => {
  const gym = await Gym.findById(req.user.gym);
  if (!gym) throw new ApiError(404, 'Gym not found');

  const { name, address, phone, email, currency, absentDaysThreshold, whatsappCountryCode } = req.body;

  if (name !== undefined) gym.name = name;
  if (address !== undefined) gym.address = address;
  if (phone !== undefined) gym.phone = phone;
  if (email !== undefined) gym.email = email;
  if (currency !== undefined) gym.settings.currency = currency;
  if (absentDaysThreshold !== undefined) gym.settings.absentDaysThreshold = absentDaysThreshold;
  if (whatsappCountryCode !== undefined) gym.settings.whatsappCountryCode = whatsappCountryCode;

  await gym.save();
  sendResponse(res, 200, 'Settings updated successfully', { gym });
});

module.exports = { getSettings, updateSettings };
