import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Users, UserCheck, CalendarClock, IndianRupee, Dumbbell } from 'lucide-react';
import {
  useGetMemberReportQuery,
  useGetAttendanceReportQuery,
  useGetRevenueReportQuery,
  useGetTrainerReportQuery,
  useGetMembershipReportQuery
} from '../api/reportApi';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Loader from '../components/ui/Loader';
import { formatCurrency } from '../utils/format';

const ChartCard = ({ title, children }) => (
  <div className="rounded-xl2 bg-white p-5 shadow-soft">
    <p className="mb-4 text-sm font-medium text-ink-700">{title}</p>
    <div className="h-64">{children}</div>
  </div>
);

const Reports = () => {
  const { data: memberRes, isLoading: l1 } = useGetMemberReportQuery();
  const { data: attendanceRes, isLoading: l2 } = useGetAttendanceReportQuery();
  const { data: revenueRes, isLoading: l3 } = useGetRevenueReportQuery();
  const { data: trainerRes, isLoading: l4 } = useGetTrainerReportQuery();
  const { data: membershipRes, isLoading: l5 } = useGetMembershipReportQuery();

  if (l1 || l2 || l3 || l4 || l5) return <Loader fullHeight />;

  const memberReport = memberRes?.data || {};
  const attendanceReport = attendanceRes?.data || {};
  const revenueReport = revenueRes?.data || {};
  const trainerReport = trainerRes?.data || {};
  const membershipReport = membershipRes?.data || {};

  const revenueChartData = (revenueReport.dailyRevenue || []).map((d) => ({ date: d._id.slice(5), amount: d.total }));
  const attendanceChartData = (attendanceReport.monthlyAttendance || []).map((d) => ({ date: d._id.slice(5), visits: d.count }));

  return (
    <div>
      <PageHeader title="Reports" description="Members, attendance, revenue, and trainer performance at a glance." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard label="Total members" value={memberReport.totalMembers ?? 0} icon={Users} accent="ink" />
        <StatCard label="New this month" value={memberReport.newMembersThisMonth ?? 0} icon={UserCheck} accent="mint" />
        <StatCard label="Today's visits" value={attendanceReport.todaysAttendance ?? 0} icon={CalendarClock} accent="brand" />
        <StatCard label="Revenue (period)" value={formatCurrency(revenueReport.totalRevenue)} icon={IndianRupee} accent="mint" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue trend (this month)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E4572E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E4572E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0EC" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9BA1B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9BA1B0' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #E3E5EA', fontSize: 12 }} />
              <Area type="monotone" dataKey="amount" stroke="#E4572E" strokeWidth={2} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attendance trend (this month)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0EC" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9BA1B0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9BA1B0' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E3E5EA', fontSize: 12 }} />
              <Bar dataKey="visits" fill="#1FA97C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl2 bg-white p-5 shadow-soft">
          <p className="mb-3 text-sm font-medium text-ink-700">Memberships</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-xl font-semibold text-mint-600">{membershipReport.expiring ?? 0}</p>
              <p className="text-xs text-ink-400">Active</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-rose-600">{membershipReport.expired ?? 0}</p>
              <p className="text-xs text-ink-400">Expired</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-brand">{membershipReport.renewed ?? 0}</p>
              <p className="text-xs text-ink-400">Renewed</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl2 bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-700">Trainer-wise members</p>
            <span className="flex items-center gap-1 text-xs text-ink-400">
              <Dumbbell size={13} /> {trainerReport.unassignedMembers ?? 0} unassigned
            </span>
          </div>
          {!trainerReport.trainerWiseMembers?.length ? (
            <p className="text-sm text-ink-400">No trainers assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {trainerReport.trainerWiseMembers.map((t) => (
                <li key={t._id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">{t.trainer?.name}</span>
                  <span className="font-medium text-ink-900">{t.memberCount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
