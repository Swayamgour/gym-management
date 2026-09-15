const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Lead = require('../models/Lead');
const Member = require('../models/Member');
const { getPagination, buildMeta } = require('../utils/pagination');

// @desc Create a new lead / enquiry
// @route POST /api/v1/leads
const createLead = asyncHandler(async (req, res) => {
  const { name, mobile, interestedPackage, enquiryDate, followUpDate, notes } = req.body;
  const lead = await Lead.create({
    gym: req.user.gym,
    name,
    mobile,
    interestedPackage,
    enquiryDate,
    followUpDate,
    notes,
    createdBy: req.user._id
  });
  sendResponse(res, 201, 'Lead created successfully', { lead });
});

// @desc List leads with search/status filters
// @route GET /api/v1/leads
const getLeads = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { gym: req.user.gym };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } }
    ];
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter).populate('interestedPackage', 'name price').sort({ followUpDate: 1 }).skip(skip).limit(limit),
    Lead.countDocuments(filter)
  ]);

  sendResponse(res, 200, 'Leads fetched successfully', { leads }, buildMeta(total, page, limit));
});

// @desc Get single lead
// @route GET /api/v1/leads/:id
const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, gym: req.user.gym }).populate('interestedPackage', 'name price');
  if (!lead) throw new ApiError(404, 'Lead not found');
  sendResponse(res, 200, 'Lead fetched', { lead });
});

// @desc Update a lead (status, follow-up date, notes, etc.)
// @route PUT /api/v1/leads/:id
const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!lead) throw new ApiError(404, 'Lead not found');

  ['name', 'mobile', 'interestedPackage', 'followUpDate', 'status', 'notes'].forEach((field) => {
    if (req.body[field] !== undefined) lead[field] = req.body[field];
  });

  await lead.save();
  sendResponse(res, 200, 'Lead updated successfully', { lead });
});

// @desc Convert a lead into a full member record
// @route POST /api/v1/leads/:id/convert
const convertLeadToMember = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, gym: req.user.gym });
  if (!lead) throw new ApiError(404, 'Lead not found');
  if (lead.status === 'converted') throw new ApiError(400, 'Lead is already converted');

  const member = await Member.create({
    gym: req.user.gym,
    name: lead.name,
    mobile: lead.mobile,
    joiningDate: new Date()
  });

  lead.status = 'converted';
  lead.convertedMember = member._id;
  await lead.save();

  sendResponse(res, 201, 'Lead converted to member successfully', { member, lead });
});

// @desc Delete a lead
// @route DELETE /api/v1/leads/:id
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({ _id: req.params.id, gym: req.user.gym });
  if (!lead) throw new ApiError(404, 'Lead not found');
  sendResponse(res, 200, 'Lead deleted successfully');
});

module.exports = { createLead, getLeads, getLeadById, updateLead, convertLeadToMember, deleteLead };
