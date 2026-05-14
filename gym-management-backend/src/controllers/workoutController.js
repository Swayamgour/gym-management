const WorkoutPlan = require('../models/WorkoutPlan');

// @desc    Get workout plans for a member
// @route   GET /api/workouts/member/:memberId
// @access  Private
const getMemberWorkouts = async (req, res) => {
    try {
        const workouts = await WorkoutPlan.find({ memberId: req.params.memberId, isActive: true })
            .populate('trainerId', 'name');
        res.json({ success: true, workouts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create workout plan
// @route   POST /api/workouts
// @access  Private (trainer/manager/owner)
const createWorkout = async (req, res) => {
    try {
        const workout = await WorkoutPlan.create(req.body);
        res.status(201).json({ success: true, workout });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update workout plan
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
    try {
        const workout = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout plan not found' });
        }
        res.json({ success: true, workout });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMemberWorkouts, createWorkout, updateWorkout };
