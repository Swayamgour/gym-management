const Payment = require('../models/Payment');
const Member = require('../models/Member');
const Plan = require('../models/Plan');

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
    try {
        const { memberId, planId, amount, paymentMethod, validFrom, validTo } = req.body;
        
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        
        const payment = await Payment.create({
            memberId,
            planId,
            amount,
            paymentMethod,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            receivedBy: req.user.id,
            transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        });
        
        member.planId = planId;
        member.expiryDate = new Date(validTo);
        member.isActive = true;
        await member.save();
        
        res.status(201).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
    try {
        const { startDate, endDate, memberId } = req.query;
        let query = {};
        
        if (startDate && endDate) {
            query.paymentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (memberId) query.memberId = memberId;
        
        const payments = await Payment.find(query)
            .populate('memberId', 'name phone')
            .populate('planId', 'name price')
            .sort({ paymentDate: -1 });
        
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        
        res.json({ 
            success: true, 
            count: payments.length,
            totalRevenue,
            payments 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get pending payments
// @route   GET /api/payments/pending
// @access  Private
const getPendingPayments = async (req, res) => {
    try {
        const members = await Member.find({
            isActive: true,
            expiryDate: { $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        }).populate('planId');
        
        const pending = members.map(m => ({
            memberId: m._id,
            name: m.name,
            phone: m.phone,
            planName: m.planId?.name,
            expiryDate: m.expiryDate,
            daysLeft: Math.ceil((m.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
        }));
        
        res.json({ success: true, pending });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createPayment, getPayments, getPendingPayments };
