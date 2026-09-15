const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    settings: {
      currency: { type: String, default: 'INR' },
      absentDaysThreshold: { type: Number, default: 5 },
      whatsappCountryCode: { type: String, default: '91' }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gym', gymSchema);
