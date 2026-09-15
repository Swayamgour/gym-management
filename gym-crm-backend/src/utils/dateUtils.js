const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d;
};

const daysBetween = (from, to) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return Math.round((b - a) / msPerDay);
};

// Buckets used across dashboard / membership list / action-required widget
const getExpiryBucket = (expiryDate) => {
  const daysLeft = daysBetween(new Date(), expiryDate);
  if (daysLeft < 0) return 'expired';
  if (daysLeft === 0) return 'expires_today';
  if (daysLeft <= 3) return '1-3_days';
  if (daysLeft <= 7) return '4-7_days';
  if (daysLeft <= 15) return '8-15_days';
  if (daysLeft <= 30) return '16-30_days';
  return 'safe';
};

const startOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

const endOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

module.exports = {
  startOfDay,
  endOfDay,
  addDays,
  daysBetween,
  getExpiryBucket,
  startOfMonth,
  endOfMonth
};
