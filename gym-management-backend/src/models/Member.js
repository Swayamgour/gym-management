const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    photo: {
        type: String,
        default: null
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    age: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        default: 0
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    qrCode: {
        type: String,
        unique: true
    },
    qrCodeImage: {
        type: String
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    medicalConditions: String
}, {
    timestamps: true
});

// Auto-generate QR code before saving
memberSchema.pre('save', async function(next) {
    if (!this.qrCode) {
        this.qrCode = `GYM_${this._id}_${Date.now()}`;
    }
    next();
});

module.exports = mongoose.model('Member', memberSchema);
