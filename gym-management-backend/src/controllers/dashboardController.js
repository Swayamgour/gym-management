const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const totalMembers = await Member.countDocuments();
        
        const activeMembers = await Member.countDocuments({
            expiryDate: { $gt: new Date() },
            isActive: true
        });
        
        const expiredMembers = await Member.countDocuments({
            expiryDate: { $lt: new Date() }
        });
        
        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: today }
        });
        
        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    paymentDate: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        const renewals = await Payment.countDocuments({
            paymentDate: { $gte: monthStart, $lte: monthEnd }
        });
        
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        const pendingRenewals = await Member.countDocuments({
            expiryDate: { $gte: new Date(), $lte: sevenDaysFromNow },
            isActive: true
        });
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const newMembers = await Member.find({
            createdAt: { $gte: sevenDaysAgo }
        }).limit(10).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            stats: {
                totalMembers,
                activeMembers,
                expiredMembers,
                todayAttendance,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                renewals,
                pendingRenewals,
                recentMembers: newMembers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue-chart
// @access  Private
const getRevenueChart = async (req, res) => {
    try {
        const last6Months = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            
            const revenue = await Payment.aggregate([
                {
                    $match: {
                        paymentDate: { $gte: month, $lte: monthEnd }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);
            
            last6Months.push({
                month: month.toLocaleString('default', { month: 'short' }),
                revenue: revenue[0]?.total || 0
            });
        }
        
        res.json({ success: true, data: last6Months });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStats, getRevenueChart };
