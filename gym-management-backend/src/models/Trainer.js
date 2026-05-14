const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: [{
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'cardio', 'yoga', 'crossfit']
    }],
    experience: {
        type: Number,
        default: 0
    },
    qualification: String,
    salary: {
        type: Number,
        required: true
    },
    assignedMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    }],
    schedule: {
        monday: { start: String, end: String },
        tuesday: { start: String, end: String },
        wednesday: { start: String, end: String },
        thursday: { start: String, end: String },
        friday: { start: String, end: String },
        saturday: { start: String, end: String },
        sunday: { start: String, end: String }
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trainer', trainerSchema);
