import Badge from './ui/Badge';

const map = {
  active: { label: 'Active', tone: 'mint' },
  expired: { label: 'Expired', tone: 'rose' },
  upcoming: { label: 'Upcoming', tone: 'neutral' }
};

const MembershipStatusBadge = ({ status }) => {
  const item = map[status] || { label: status || 'No membership', tone: 'neutral' };
  return <Badge tone={item.tone}>{item.label}</Badge>;
};

export default MembershipStatusBadge;
