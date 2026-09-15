const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');
const Gym = require('../models/Gym');
const User = require('../models/User');

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
}

// @desc  Register a new gym along with its owner account
// @route POST /api/v1/auth/register
const registerGymOwner = asyncHandler(async (req, res) => {
  const { gymName, gymPhone, gymAddress, name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const gym = await Gym.create({
    name: gymName,
    phone: gymPhone,
    address: gymAddress,
    email
  });

  const owner = await User.create({
    gym: gym._id,
    name,
    email,
    phone,
    password,
    role: 'owner'
  });

  gym.owner = owner._id;
  await gym.save();

  const token = generateToken({ id: owner._id, gymId: gym._id, role: owner.role });

  sendResponse(res, 201, 'Gym and owner account created successfully', {
    token,
    user: sanitizeUser(owner),
    gym
  });
});

// @desc  Login
// @route POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password').populate('gym', 'name settings');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact your gym owner.');
  }

  const token = generateToken({ id: user._id, gymId: user.gym._id, role: user.role });

  sendResponse(res, 200, 'Login successful', {
    token,
    user: sanitizeUser(user)
  });
});

// @desc  Get logged-in user profile
// @route GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('gym', 'name settings');
  sendResponse(res, 200, 'Profile fetched', { user: sanitizeUser(user) });
});

// @desc  Owner/Manager creates staff (manager/trainer/receptionist)
// @route POST /api/v1/auth/staff
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, specialization } = req.body;

  if (!['manager', 'trainer', 'receptionist'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Allowed: manager, trainer, receptionist');
  }
  if (req.user.role === 'manager' && role === 'manager') {
    throw new ApiError(403, 'Managers cannot create other managers');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const staff = await User.create({
    gym: req.user.gym,
    name,
    email,
    phone,
    password,
    role,
    specialization
  });

  sendResponse(res, 201, 'Staff account created successfully', { user: sanitizeUser(staff) });
});

// @desc  List all staff of the gym
// @route GET /api/v1/auth/staff
const listStaff = asyncHandler(async (req, res) => {
  const filter = { gym: req.user.gym };
  if (req.query.role) filter.role = req.query.role;

  const staff = await User.find(filter).sort({ createdAt: -1 });
  sendResponse(res, 200, 'Staff list fetched', { staff: staff.map(sanitizeUser) });
});

// @desc  Update staff (activate/deactivate, role, details)
// @route PUT /api/v1/auth/staff/:id
const updateStaff = asyncHandler(async (req, res) => {
  const { name, phone, specialization, isActive, role } = req.body;

  const staff = await User.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!staff) throw new ApiError(404, 'Staff member not found');
  if (staff.role === 'owner') throw new ApiError(403, 'Owner account cannot be modified here');

  if (name !== undefined) staff.name = name;
  if (phone !== undefined) staff.phone = phone;
  if (specialization !== undefined) staff.specialization = specialization;
  if (isActive !== undefined) staff.isActive = isActive;
  if (role !== undefined && ['manager', 'trainer', 'receptionist'].includes(role)) staff.role = role;

  await staff.save();
  sendResponse(res, 200, 'Staff updated successfully', { user: sanitizeUser(staff) });
});

// @desc  Change own password
// @route PUT /api/v1/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();

  sendResponse(res, 200, 'Password changed successfully');
});

module.exports = {
  registerGymOwner,
  login,
  getMe,
  createStaff,
  listStaff,
  updateStaff,
  changePassword
};
