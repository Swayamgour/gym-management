const Member = require('../models/Member');
const QRCode = require('qrcode');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
    try {
        const { status, branchId, trainerId } = req.query;
        let query = {};
        
        if (status === 'active') {
            query.isActive = true;
            query.expiryDate = { $gt: new Date() };
        } else if (status === 'expired') {
            query.expiryDate = { $lt: new Date() };
        }
        
        if (branchId) query.branchId = branchId;
        if (trainerId) query.trainerId = trainerId;
        
        const members = await Member.find(query)
            .populate('planId', 'name price')
            .populate('trainerId', 'name')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, count: members.length, members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
const getMember = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id)
            .populate('planId')
            .populate('trainerId', 'name email');
        
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create member
// @route   POST /api/members
// @access  Private
const createMember = async (req, res) => {
    try {
        const memberData = req.body;
        
        const plan = await require('../models/Plan').findById(memberData.planId);
        if (!plan) {
            return res.status(400).json({ success: false, message: 'Invalid plan' });
        }
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + plan.duration);
        memberData.expiryDate = expiryDate;
        
        const member = await Member.create(memberData);
        
        const qrData = JSON.stringify({
            id: member._id,
            name: member.name,
            phone: member.phone
        });
        
        const qrImage = await QRCode.toDataURL(qrData);
        member.qrCodeImage = qrImage;
        await member.save();
        
        res.status(201).json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
const deleteMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        
        res.json({ success: true, message: 'Member deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get member by QR
// @route   POST /api/members/qr-scan
// @access  Private
const scanQR = async (req, res) => {
    try {
        const { qrData } = req.body;
        const data = JSON.parse(qrData);
        const member = await Member.findById(data.id);
        
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMembers, getMember, createMember, updateMember, deleteMember, scanQR };
