import { useGetDashboardStatsQuery, useGetRevenueChartQuery, useGetPendingPaymentsQuery } from "../store/gymApi";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { Users, UserCheck, UserX, CalendarCheck, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";

function StatCard({ label, value, icon: Icon, gradient, sub }: {
  label: string; value: string | number; icon: any; gradient: string; sub?: string;
}) {
  return (
    <div className="stat-card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          ₹{payload[0].value?.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading, refetch } = useGetDashboardStatsQuery(undefined);
  const { data: chartData, isLoading: chartLoading } = useGetRevenueChartQuery(undefined);
  const { data: pendingData } = useGetPendingPaymentsQuery(undefined);

  const stats = statsData?.stats;
  const chartValues = chartData?.data || [];
  const pending = pendingData?.pending || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Members", value: stats?.totalMembers ?? "—", icon: Users, gradient: "gradient-primary", sub: "All registered" },
    { label: "Active Members", value: stats?.activeMembers ?? "—", icon: UserCheck, gradient: "gradient-success", sub: "Valid memberships" },
    { label: "Expired Members", value: stats?.expiredMembers ?? "—", icon: UserX, gradient: "gradient-destructive", sub: "Need renewal" },
    { label: "Today Present", value: stats?.todayAttendance ?? "—", icon: CalendarCheck, gradient: "gradient-warning", sub: "Checked in today" },
    { label: "Monthly Revenue", value: stats?.monthlyRevenue ? `₹${stats.monthlyRevenue.toLocaleString("en-IN")}` : "—", icon: TrendingUp, gradient: "gradient-primary", sub: "This month" },
    { label: "Pending Renewals", value: stats?.pendingRenewals ?? "—", icon: AlertTriangle, gradient: "gradient-warning", sub: "Expiring in 7 days" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
          </div>
          {chartLoading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartValues}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216,34%,17%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215,20%,65%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215,20%,65%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(263, 70%, 58%)" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pending Renewals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Expiring Soon</h3>
            <span className="badge-pending">{pending.length} members</span>
          </div>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No expiring memberships</p>
            ) : (
              pending.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.phone}</p>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${m.daysLeft < 0 ? "text-destructive" : m.daysLeft <= 3 ? "text-red-400" : "text-yellow-400"}`}>
                    {m.daysLeft < 0 ? `${Math.abs(m.daysLeft)}d overdue` : `${m.daysLeft}d left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Members */}
      {stats?.recentMembers?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-foreground mb-4">Recent Members</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left pb-3 px-2">Name</th>
                  <th className="table-header text-left pb-3 px-2">Phone</th>
                  <th className="table-header text-left pb-3 px-2">Joined</th>
                  <th className="table-header text-left pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentMembers.map((m: any) => (
                  <tr key={m._id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="table-cell px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.name?.charAt(0)}
                        </div>
                        <span className="font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="table-cell px-2 text-muted-foreground">{m.phone}</td>
                    <td className="table-cell px-2 text-muted-foreground text-xs">
                      {new Date(m.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="table-cell px-2">
                      <span className={new Date(m.expiryDate) > new Date() ? "badge-active" : "badge-expired"}>
                        {new Date(m.expiryDate) > new Date() ? "Active" : "Expired"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
