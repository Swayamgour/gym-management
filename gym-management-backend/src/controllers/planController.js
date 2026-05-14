const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Private
const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true });
        res.json({ success: true, count: plans.length, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create plan
// @route   POST /api/plans
// @access  Private (owner/manager)
const createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private (owner/manager)
const updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private (owner)
const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        res.json({ success: true, message: 'Plan deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan };
