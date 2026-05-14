const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    phone: String,
    email: String,
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    operatingHours: {
        open: String,
        close: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscriptionCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Branch', branchSchema);
