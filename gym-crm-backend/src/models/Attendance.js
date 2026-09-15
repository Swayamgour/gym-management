const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, default: null },
    durationMinutes: { type: Number, default: null },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

attendanceSchema.index({ gym: 1, member: 1, date: 1 });
attendanceSchema.index({ gym: 1, checkOut: 1 });
attendanceSchema.index({ gym: 1, checkIn: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
