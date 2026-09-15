const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    channel: { type: String, enum: ['whatsapp', 'call', 'sms', 'email'], default: 'whatsapp' },
    messageType: {
      type: String,
      enum: ['expiry', 'payment_pending', 'welcome', 'absent', 'renewal', 'custom'],
      default: 'custom'
    },
    message: { type: String, trim: true },
    status: { type: String, enum: ['generated', 'sent', 'failed'], default: 'generated' },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', followUpSchema);
