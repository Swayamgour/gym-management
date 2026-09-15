const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    address: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },
    emergencyContact: { type: String, trim: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    currentMembership: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', default: null },
    // isActive = account status (soft delete). Membership status (active/expired)
    // is tracked separately on the Membership model.
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

memberSchema.index({ gym: 1, mobile: 1 });
memberSchema.index({ name: 'text', mobile: 'text', email: 'text' });

module.exports = mongoose.model('Member', memberSchema);
