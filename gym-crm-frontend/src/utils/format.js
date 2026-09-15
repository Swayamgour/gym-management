import { format, formatDistanceToNow, isValid } from 'date-fns';

export const formatDate = (date, pattern = 'd MMM yyyy') => {
  if (!date) return '—';
  const d = new Date(date);
  return isValid(d) ? format(d, pattern) : '—';
};

export const formatDateTime = (date) => formatDate(date, 'd MMM, h:mm a');

export const formatRelative = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—';
};

export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
