const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    weight: Number,
    bodyFat: Number,
    muscleMass: Number,
    bmi: Number,
    measurements: {
        chest: Number,
        waist: Number,
        hips: Number,
        biceps: Number,
        thighs: Number
    },
    photos: [String],
    notes: String,
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

progressSchema.pre('save', function(next) {
    next();
});

module.exports = mongoose.model('Progress', progressSchema);
