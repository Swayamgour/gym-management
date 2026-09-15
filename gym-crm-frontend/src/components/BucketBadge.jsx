import Badge from './ui/Badge';

const bucketMap = {
  expired: { label: 'Expired', tone: 'rose' },
  expires_today: { label: 'Expires today', tone: 'rose' },
  '1-3_days': { label: '1–3 days left', tone: 'amber' },
  '4-7_days': { label: '4–7 days left', tone: 'amber' },
  '8-15_days': { label: '8–15 days left', tone: 'neutral' },
  '16-30_days': { label: '16–30 days left', tone: 'neutral' },
  safe: { label: 'Active', tone: 'mint' }
};

const BucketBadge = ({ bucket }) => {
  const item = bucketMap[bucket] || bucketMap.safe;
  return <Badge tone={item.tone}>{item.label}</Badge>;
};

export default BucketBadge;
