const DietPlan = require('../models/DietPlan');

// @desc    Get diet plans for a member
// @route   GET /api/diets/member/:memberId
// @access  Private
const getMemberDiets = async (req, res) => {
    try {
        const diets = await DietPlan.find({ memberId: req.params.memberId, isActive: true })
            .populate('trainerId', 'name');
        res.json({ success: true, diets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create diet plan
// @route   POST /api/diets
// @access  Private (trainer/manager/owner)
const createDiet = async (req, res) => {
    try {
        const diet = await DietPlan.create(req.body);
        res.status(201).json({ success: true, diet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update diet plan
// @route   PUT /api/diets/:id
// @access  Private
const updateDiet = async (req, res) => {
    try {
        const diet = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!diet) {
            return res.status(404).json({ success: false, message: 'Diet plan not found' });
        }
        res.json({ success: true, diet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMemberDiets, createDiet, updateDiet };
