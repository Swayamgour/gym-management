const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    interestedPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null },
    enquiryDate: { type: Date, default: Date.now },
    followUpDate: { type: Date },
    status: {
      type: String,
      enum: ['new', 'follow-up', 'trial', 'converted', 'not-interested'],
      default: 'new'
    },
    notes: { type: String, trim: true },
    convertedMember: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
