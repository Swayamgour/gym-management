const Progress = require('../models/Progress');

// @desc    Get member progress
// @route   GET /api/progress/member/:memberId
// @access  Private
const getMemberProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ memberId: req.params.memberId })
            .sort({ date: -1 });
        res.json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add progress entry
// @route   POST /api/progress
// @access  Private
const addProgress = async (req, res) => {
    try {
        const progressData = { ...req.body, recordedBy: req.user.id };
        const progress = await Progress.create(progressData);
        res.status(201).json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMemberProgress, addProgress };
