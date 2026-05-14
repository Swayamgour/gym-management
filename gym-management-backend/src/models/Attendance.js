const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    checkInTime: {
        type: Date,
        default: Date.now
    },
    checkOutTime: {
        type: Date
    },
    method: {
        type: String,
        enum: ['qr', 'manual', 'barcode', 'face'],
        default: 'manual'
    },
    date: {
        type: Date,
        default: Date.now
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Index for efficient queries
attendanceSchema.index({ memberId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
