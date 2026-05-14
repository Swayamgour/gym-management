const Trainer = require('../models/Trainer');
const User = require('../models/User');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
const getTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.find().populate('userId', 'name email phone').populate('assignedMembers', 'name phone');
        res.json({ success: true, count: trainers.length, trainers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Private
const getTrainer = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id).populate('userId', 'name email phone').populate('assignedMembers', 'name phone');
        if (!trainer) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }
        res.json({ success: true, trainer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create trainer profile
// @route   POST /api/trainers
// @access  Private (owner/manager)
const createTrainer = async (req, res) => {
    try {
        const trainer = await Trainer.create(req.body);
        res.status(201).json({ success: true, trainer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private (owner/manager)
const updateTrainer = async (req, res) => {
    try {
        const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!trainer) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }
        res.json({ success: true, trainer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTrainers, getTrainer, createTrainer, updateTrainer };
