const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

// @desc    Check-in member
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res) => {
    try {
        const { memberId, method } = req.body;
        
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        
        if (!member.isActive || new Date(member.expiryDate) < new Date()) {
            return res.status(400).json({ success: false, message: 'Membership expired' });
        }
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const existingAttendance = await Attendance.findOne({
            memberId,
            date: { $gte: todayStart, $lte: todayEnd }
        });
        
        if (existingAttendance) {
            return res.status(400).json({ success: false, message: 'Already checked in today' });
        }
        
        const attendance = await Attendance.create({
            memberId,
            method,
            branchId: member.branchId,
            markedBy: req.user.id
        });
        
        res.status(201).json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check-out member
// @route   PUT /api/attendance/checkout/:id
// @access  Private
const checkOut = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        
        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        }
        
        attendance.checkOutTime = new Date();
        await attendance.save();
        
        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const attendance = await Attendance.find({
            date: { $gte: todayStart, $lte: todayEnd }
        }).populate('memberId', 'name phone photo');
        
        res.json({ success: true, count: attendance.length, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get member attendance history
// @route   GET /api/attendance/member/:memberId
// @access  Private
const getMemberAttendance = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { startDate, endDate } = req.query;
        
        let query = { memberId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const attendance = await Attendance.find(query)
            .sort({ date: -1 })
            .limit(30);
        
        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { checkIn, checkOut, getTodayAttendance, getMemberAttendance };
