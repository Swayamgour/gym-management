import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, DoorOpen, CalendarClock, CalendarX, Wallet, IndianRupee, Phone, MessageCircle, Eye, RefreshCw } from 'lucide-react';
import { useGetDashboardStatsQuery, useGetActionRequiredQuery } from '../api/dashboardApi';
import StatCard from '../components/ui/StatCard';
import Loader from '../components/ui/Loader';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import BucketBadge from '../components/BucketBadge';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { listContainer, listItemStatic } from '../components/ui/listStyles';
import { formatCurrency, formatDate } from '../utils/format';
import { useWhatsApp } from '../hooks/useWhatsApp';

const TABS = [
  { value: 'expired', label: 'Expired' },
  { value: 'expiringSoon', label: 'Expiring soon' },
  { value: 'pendingPayments', label: 'Pending payments' },
  { value: 'inactiveMembers', label: 'Lapsed members' }
];

const messageTypeFor = { expired: 'expiry', expiringSoon: 'expiry', pendingPayments: 'payment_pending', inactiveMembers: 'absent' };

const Dashboard = () => {
  const { data: statsRes, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: actionRes, isLoading: actionLoading } = useGetActionRequiredQuery();
  const [tab, setTab] = useState('expired');
  const navigate = useNavigate();
  const { send } = useWhatsApp();

  if (statsLoading || actionLoading) return <Loader fullHeight label="Loading your dashboard..." />;

  const stats = statsRes?.data || {};
  const action = actionRes?.data || {};

  const list =
    tab === 'expired'
      ? action.expiredMemberships
      : tab === 'expiringSoon'
      ? action.expiringSoon
      : tab === 'pendingPayments'
      ? action.pendingPayments
      : action.inactiveMembers;

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count:
      (t.value === 'expired' && action.expiredMemberships?.length) ||
      (t.value === 'expiringSoon' && action.expiringSoon?.length) ||
      (t.value === 'pendingPayments' && action.pendingPayments?.length) ||
      (t.value === 'inactiveMembers' && action.inactiveMembers?.length) ||
      0
  }));

  return (
    <div>
      <PageHeader title="Dashboard" description="Everything that needs your attention today, in one place." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard label="Total members" value={stats.totalMembers ?? 0} icon={Users} accent="ink" />
        <StatCard label="Active members" value={stats.activeMembers ?? 0} icon={UserCheck} accent="mint" />
        <StatCard label="Today's attendance" value={stats.todayAttendance ?? 0} icon={CalendarClock} accent="brand" />
        <StatCard label="Currently in gym" value={stats.currentlyInGym ?? 0} icon={DoorOpen} accent="brand" />
        <StatCard label="Expiring in 7 days" value={stats.expiringSoon ?? 0} icon={CalendarClock} accent="amber" />
        <StatCard label="Expired" value={stats.expired ?? 0} icon={CalendarX} accent="rose" />
        <StatCard label="Pending payments" value={stats.pendingPayments ?? 0} icon={Wallet} accent="amber" />
        <StatCard label="This month revenue" value={formatCurrency(stats.thisMonthRevenue)} icon={IndianRupee} accent="mint" />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Action required</h2>
          <Tabs tabs={tabsWithCounts} active={tab} onChange={setTab} />
        </div>

        <div className={list?.length ? '' : 'rounded-xl2 bg-white shadow-soft'}>
          {!list?.length ? (
            <div className="p-2">
              <EmptyState title="Nothing here right now" description="This list will fill up as memberships move through their lifecycle." />
            </div>
          ) : (
            <ul className={listContainer}>
              {list.map((item) => {
                const member = item.member || item;
                const pendingAmount = item.pendingAmount;
                return (
                  <li key={item._id} className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${listItemStatic}`}>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={member?.name} src={member?.photo} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{member?.name}</p>
                        <p className="text-xs text-ink-400">
                          {member?.mobile}
                          {item.expiryDate && ` · Expiry ${formatDate(item.expiryDate)}`}
                          {pendingAmount !== undefined && ` · Pending ${formatCurrency(pendingAmount)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.expiryBucket && <BucketBadge bucket={item.expiryBucket} />}
                      <Button variant="outline" size="sm" onClick={() => navigate(`/members/${member?._id}`)}>
                        <Eye size={14} /> <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(`tel:${member?.mobile}`)}>
                        <Phone size={14} /> <span className="hidden sm:inline">Call</span>
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => send({ memberId: member?._id, messageType: messageTypeFor[tab] })}
                      >
                        <MessageCircle size={14} /> <span className="hidden sm:inline">WhatsApp</span>
                      </Button>
                      {(tab === 'expired' || tab === 'inactiveMembers') && (
                        <Button variant="primary" size="sm" onClick={() => navigate(`/members/${member?._id}?tab=membership`)}>
                          <RefreshCw size={14} /> <span className="hidden sm:inline">Renew</span>
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
