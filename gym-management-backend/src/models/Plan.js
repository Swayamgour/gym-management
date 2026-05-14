const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    durationType: {
        type: String,
        enum: ['days', 'months', 'years'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    features: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }
}, {
    timestamps: true
});

// Predefined plans
planSchema.statics.createDefaultPlans = async function(branchId) {
    const defaultPlans = [
        { name: 'Basic 1 Month', duration: 30, durationType: 'days', price: 999, features: ['Gym Access', 'Basic Equipment'] },
        { name: 'Standard 3 Month', duration: 90, durationType: 'days', price: 2499, features: ['Gym Access', 'Locker', 'Trainer Support'] },
        { name: 'Premium 1 Year', duration: 365, durationType: 'days', price: 7999, features: ['Gym Access', 'Locker', 'Personal Trainer', 'Diet Plan'] }
    ];
    
    for (let plan of defaultPlans) {
        plan.branchId = branchId;
        await this.findOneAndUpdate({ name: plan.name, branchId }, plan, { upsert: true });
    }
};

module.exports = mongoose.model('Plan', planSchema);
