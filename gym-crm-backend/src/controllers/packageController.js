const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Package = require('../models/Package');

// @desc Create package
// @route POST /api/v1/packages
const createPackage = asyncHandler(async (req, res) => {
  const { name, durationInDays, price, description } = req.body;
  const pkg = await Package.create({ gym: req.user.gym, name, durationInDays, price, description });
  sendResponse(res, 201, 'Package created successfully', { package: pkg });
});

// @desc List packages
// @route GET /api/v1/packages
const getPackages = asyncHandler(async (req, res) => {
  const filter = { gym: req.user.gym };
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  const packages = await Package.find(filter).sort({ price: 1 });
  sendResponse(res, 200, 'Packages fetched successfully', { packages });
});

// @desc Get single package
// @route GET /api/v1/packages/:id
const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!pkg) throw new ApiError(404, 'Package not found');
  sendResponse(res, 200, 'Package fetched', { package: pkg });
});

// @desc Update package
// @route PUT /api/v1/packages/:id
const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!pkg) throw new ApiError(404, 'Package not found');

  ['name', 'durationInDays', 'price', 'description', 'isActive'].forEach((field) => {
    if (req.body[field] !== undefined) pkg[field] = req.body[field];
  });

  await pkg.save();
  sendResponse(res, 200, 'Package updated successfully', { package: pkg });
});

// @desc Deactivate package (soft delete)
// @route DELETE /api/v1/packages/:id
const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!pkg) throw new ApiError(404, 'Package not found');

  pkg.isActive = false;
  await pkg.save();
  sendResponse(res, 200, 'Package deactivated successfully');
});

module.exports = { createPackage, getPackages, getPackageById, updatePackage, deletePackage };
