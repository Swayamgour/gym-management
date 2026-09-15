const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    packageName: { type: String, required: true },
    durationInDays: { type: Number, required: true },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'expired', 'upcoming'],
      default: 'active'
    },
    isRenewal: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

membershipSchema.virtual('pendingAmount').get(function getPendingAmount() {
  return Math.max(this.amount - this.paidAmount, 0);
});

membershipSchema.set('toJSON', { virtuals: true });
membershipSchema.set('toObject', { virtuals: true });

membershipSchema.index({ gym: 1, member: 1, createdAt: -1 });
membershipSchema.index({ gym: 1, expiryDate: 1 });
membershipSchema.index({ gym: 1, status: 1 });

module.exports = mongoose.model('Membership', membershipSchema);
