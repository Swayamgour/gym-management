const cron = require('node-cron');
const Membership = require('../models/Membership');

// Flips any 'active' membership whose expiryDate has passed to 'expired'.
// This keeps dashboard counts and Action Required lists accurate without
// having to recompute status on every single read.
const runExpiryCheck = async () => {
  const now = new Date();
  try {
    const result = await Membership.updateMany(
      { status: 'active', expiryDate: { $lt: now } },
      { $set: { status: 'expired' } }
    );
    console.log(`[expiry-cron] Marked ${result.modifiedCount || 0} membership(s) as expired`);
  } catch (err) {
    console.error('[expiry-cron] Failed to run expiry check:', err.message);
  }
};

// Runs every day at 00:05 server time, plus once immediately on server startup
// so statuses are correct right away (in case the server was down at 00:05).
const startExpiryCronJob = () => {
  cron.schedule('5 0 * * *', runExpiryCheck);
  runExpiryCheck();
};

module.exports = startExpiryCronJob;
module.exports.runExpiryCheck = runExpiryCheck;
