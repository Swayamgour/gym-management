const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const sendResponse = require('../utils/apiResponse');
const Member = require('../models/Member');
const Lead = require('../models/Lead');
const MessageTemplate = require('../models/MessageTemplate');
const FollowUp = require('../models/FollowUp');
const {
  DEFAULT_TEMPLATES,
  fillTemplate,
  buildWhatsAppLink,
  isCloudApiConfigured,
  sendViaCloudApi
} = require('../utils/whatsapp');

// @desc Generate a WhatsApp message + wa.me link for a member or lead.
//       Optionally auto-sends via WhatsApp Cloud API if configured & autoSend=true.
// @route POST /api/v1/whatsapp/generate
const generateMessage = asyncHandler(async (req, res) => {
  const { memberId, leadId, messageType, customMessage, autoSend } = req.body;

  let target;
  const contextExtra = {};

  if (memberId) {
    target = await Member.findOne({ _id: memberId, gym: req.user.gym }).populate('currentMembership');
    if (target && target.currentMembership) {
      contextExtra.amount = target.currentMembership.amount - target.currentMembership.paidAmount;
      contextExtra.expiryDate = new Date(target.currentMembership.expiryDate).toDateString();
    }
  } else if (leadId) {
    target = await Lead.findOne({ _id: leadId, gym: req.user.gym });
  }
  if (!target) throw new ApiError(404, 'Member or lead not found');

  let templateText = DEFAULT_TEMPLATES[messageType];
  const customTemplate = await MessageTemplate.findOne({ gym: req.user.gym, type: messageType });
  if (customTemplate) templateText = customTemplate.template;
  if (messageType === 'custom') templateText = customMessage || DEFAULT_TEMPLATES.custom;

  if (!templateText) throw new ApiError(400, 'Invalid message type');

  const context = {
    name: target.name,
    amount: contextExtra.amount !== undefined ? contextExtra.amount : '',
    expiryDate: contextExtra.expiryDate || '',
    message: customMessage || ''
  };

  const message = fillTemplate(templateText, context);
  const waLink = buildWhatsAppLink(target.mobile, message);

  const followUp = await FollowUp.create({
    gym: req.user.gym,
    member: memberId || null,
    lead: leadId || null,
    channel: 'whatsapp',
    messageType,
    message,
    status: 'generated',
    sentBy: req.user._id
  });

  let sendResult = null;
  if (autoSend && isCloudApiConfigured()) {
    try {
      sendResult = await sendViaCloudApi(target.mobile, message);
      followUp.status = 'sent';
      await followUp.save();
    } catch (err) {
      followUp.status = 'failed';
      await followUp.save();
      throw new ApiError(502, 'Failed to send WhatsApp message via Cloud API');
    }
  }

  sendResponse(res, 200, 'WhatsApp message generated successfully', {
    message,
    whatsappLink: waLink,
    sent: Boolean(sendResult),
    followUpId: followUp._id
  });
});

// @desc Get message templates for the gym (falls back to system defaults)
// @route GET /api/v1/whatsapp/templates
const getTemplates = asyncHandler(async (req, res) => {
  const customTemplates = await MessageTemplate.find({ gym: req.user.gym });
  const merged = Object.keys(DEFAULT_TEMPLATES)
    .filter((key) => key !== 'custom')
    .map((type) => {
      const found = customTemplates.find((t) => t.type === type);
      return { type, template: found ? found.template : DEFAULT_TEMPLATES[type], isCustom: Boolean(found) };
    });

  sendResponse(res, 200, 'Templates fetched successfully', { templates: merged });
});

// @desc Create/update a custom template for a message type
// @route PUT /api/v1/whatsapp/templates/:type
const upsertTemplate = asyncHandler(async (req, res) => {
  const { template } = req.body;
  const { type } = req.params;

  if (!Object.keys(DEFAULT_TEMPLATES).includes(type) || type === 'custom') {
    throw new ApiError(400, 'Invalid template type');
  }

  const updated = await MessageTemplate.findOneAndUpdate(
    { gym: req.user.gym, type },
    { template },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  sendResponse(res, 200, 'Template saved successfully', { template: updated });
});

// @desc Follow-up history for a member or lead
// @route GET /api/v1/whatsapp/history
const getFollowUpHistory = asyncHandler(async (req, res) => {
  const { memberId, leadId } = req.query;
  const filter = { gym: req.user.gym };
  if (memberId) filter.member = memberId;
  if (leadId) filter.lead = leadId;

  const history = await FollowUp.find(filter).sort({ createdAt: -1 }).limit(100);
  sendResponse(res, 200, 'Follow-up history fetched', { history });
});

module.exports = { generateMessage, getTemplates, upsertTemplate, getFollowUpHistory };
