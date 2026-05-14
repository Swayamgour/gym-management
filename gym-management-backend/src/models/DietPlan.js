const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snacks', 'dinner', 'pre_workout', 'post_workout']
    },
    time: String,
    items: [{
        name: String,
        quantity: String,
        calories: Number
    }],
    instructions: String
});

const dietPlanSchema = new mongoose.Schema({
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
    dailyMeals: {
        monday: [mealSchema],
        tuesday: [mealSchema],
        wednesday: [mealSchema],
        thursday: [mealSchema],
        friday: [mealSchema],
        saturday: [mealSchema],
        sunday: [mealSchema]
    },
    dietaryRestrictions: [String],
    dailyWaterIntake: Number,
    totalCalories: Number,
    pdfUrl: String,
    startDate: Date,
    endDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
