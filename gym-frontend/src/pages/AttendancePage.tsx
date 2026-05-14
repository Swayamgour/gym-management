import { useState } from "react";
import {
  useGetTodayAttendanceQuery, useCheckInMutation, useCheckOutMutation, useGetMembersQuery
} from "../store/gymApi";
import { UserCheck, Search, LogIn, LogOut, RefreshCw, Clock } from "lucide-react";

export default function AttendancePage() {
  const [memberId, setMemberId] = useState("");
  const [method, setMethod] = useState<"manual" | "qr">("manual");
  const [search, setSearch] = useState("");

  const { data: todayData, isLoading, refetch } = useGetTodayAttendanceQuery(undefined);
  const { data: membersData } = useGetMembersQuery({ status: "active" });
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: checkingOut }] = useCheckOutMutation();

  const todayAttendance = todayData?.attendance || [];
  const members = membersData?.members || [];

  const filteredAttendance = todayAttendance.filter((a: any) =>
    a.memberId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.memberId?.phone?.includes(search)
  );

  const handleCheckIn = async () => {
    if (!memberId) return alert("Please select a member");
    try {
      await checkIn({ memberId, method }).unwrap();
      setMemberId("");
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await checkOut(id).unwrap();
      refetch();
    } catch {
      alert("Check-out failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {todayData?.count ?? 0} members checked in today
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Check-in Panel */}
      <div className="card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserCheck size={18} className="text-primary" />
          Mark Attendance
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Member</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="input-field">
              <option value="">Choose member...</option>
              {members.map((m: any) => (
                <option key={m._id} value={m._id}>{m.name} — {m.phone}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-36">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="input-field">
              <option value="manual">Manual</option>
              <option value="qr">QR Code</option>
            </select>
          </div>
          <div className="sm:self-end">
            <button onClick={handleCheckIn} disabled={checkingIn || !memberId} className="btn-primary h-[42px] px-6">
              {checkingIn ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  Check In
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Today's Attendance</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-1.5 text-xs w-52"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="table-header text-left px-4 py-3">Member</th>
                <th className="table-header text-left px-4 py-3">Check In</th>
                <th className="table-header text-left px-4 py-3">Check Out</th>
                <th className="table-header text-left px-4 py-3">Duration</th>
                <th className="table-header text-left px-4 py-3">Method</th>
                <th className="table-header text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground text-sm">
                    No attendance recorded today
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((a: any) => {
                  const checkInTime = new Date(a.checkInTime);
                  const checkOutTime = a.checkOutTime ? new Date(a.checkOutTime) : null;
                  const duration = checkOutTime
                    ? `${Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000)}m`
                    : "In session";

                  return (
                    <tr key={a._id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="table-cell px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {a.memberId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{a.memberId?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{a.memberId?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell px-4 text-muted-foreground text-xs">
                        {checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="table-cell px-4 text-muted-foreground text-xs">
                        {checkOutTime
                          ? checkOutTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                          : <span className="badge-active">Active</span>}
                      </td>
                      <td className="table-cell px-4">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {duration}
                        </span>
                      </td>
                      <td className="table-cell px-4">
                        <span className="badge-pending capitalize">{a.method}</span>
                      </td>
                      <td className="table-cell px-4">
                        {!checkOutTime && (
                          <button
                            onClick={() => handleCheckOut(a._id)}
                            disabled={checkingOut}
                            className="btn-secondary py-1 px-2.5 text-xs"
                          >
                            <LogOut size={12} />
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
