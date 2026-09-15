const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    membership: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', 'other'],
      default: 'cash'
    },
    paymentDate: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

paymentSchema.index({ gym: 1, paymentDate: 1 });
paymentSchema.index({ gym: 1, member: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
