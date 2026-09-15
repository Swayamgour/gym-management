const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    type: {
      type: String,
      enum: ['expiry', 'payment_pending', 'welcome', 'absent', 'renewal'],
      required: true
    },
    template: { type: String, required: true }
  },
  { timestamps: true }
);

messageTemplateSchema.index({ gym: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
