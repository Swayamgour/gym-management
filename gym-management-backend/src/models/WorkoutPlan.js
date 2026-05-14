const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    restTime: Number,
    notes: String,
    videoUrl: String
});

const workoutPlanSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekDays: {
        monday: [exerciseSchema],
        tuesday: [exerciseSchema],
        wednesday: [exerciseSchema],
        thursday: [exerciseSchema],
        friday: [exerciseSchema],
        saturday: [exerciseSchema],
        sunday: [exerciseSchema]
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
