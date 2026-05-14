import { useParams, useNavigate, Link } from "react-router-dom";
import { useGetMemberQuery, useGetMemberAttendanceQuery } from "../store/gymApi";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Shield, AlertTriangle, User } from "lucide-react";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: memberData, isLoading } = useGetMemberQuery(id!);
  const { data: attendanceData } = useGetMemberAttendanceQuery(id!);

  const member = memberData?.member;
  const attendance = attendanceData?.attendance || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle size={40} className="text-destructive mb-3" />
        <h3 className="font-semibold text-foreground mb-1">Member not found</h3>
        <Link to="/members" className="btn-secondary mt-3">
          <ArrowLeft size={14} />
          Back to Members
        </Link>
      </div>
    );
  }

  const isActive = member.isActive && new Date(member.expiryDate) > new Date();
  const daysLeft = Math.ceil((new Date(member.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/members")} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="section-title">{member.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Member profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="card flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
            {member.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-foreground">{member.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{member.gender} • {member.age} years</p>
          <span className={`mt-3 ${isActive ? "badge-active" : "badge-expired"}`}>
            {isActive ? "Active Member" : "Expired"}
          </span>

          <div className="w-full mt-5 space-y-3 text-left">
            {member.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <span>{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
            {member.address?.city && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span>{member.address.city}, {member.address.state}</span>
              </div>
            )}
          </div>
        </div>

        {/* Membership Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Plan Info */}
          <div className="card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Membership Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                <p className="font-semibold text-foreground">{member.planId?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Plan Price</p>
                <p className="font-semibold text-foreground">₹{member.planId?.price?.toLocaleString("en-IN") || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Joining Date</p>
                <p className="font-semibold text-foreground">
                  {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString("en-IN") : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expiry Date</p>
                <p className={`font-semibold ${isActive ? "text-green-400" : "text-destructive"}`}>
                  {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString("en-IN") : "—"}
                </p>
              </div>
            </div>

            {/* Expiry bar */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Membership validity</span>
                <span className={`font-medium ${daysLeft < 0 ? "text-destructive" : daysLeft <= 7 ? "text-yellow-400" : "text-green-400"}`}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${daysLeft < 0 ? "gradient-destructive" : daysLeft <= 7 ? "gradient-warning" : "gradient-primary"}`}
                  style={{ width: `${Math.max(0, Math.min(100, (daysLeft / 365) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {member.emergencyContact?.name && (
            <div className="card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <User size={16} className="text-primary" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{member.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{member.emergencyContact.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Relation</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 capitalize">{member.emergencyContact.relation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          {member.medicalConditions && (
            <div className="card border-warning/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-yellow-400" />
                <h3 className="font-semibold text-foreground text-sm">Medical Conditions</h3>
              </div>
              <p className="text-sm text-muted-foreground">{member.medicalConditions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Attendance History
          </h3>
          <span className="badge-active">{attendance.length} sessions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="table-header text-left px-5 py-3">Date</th>
                <th className="table-header text-left px-5 py-3">Check In</th>
                <th className="table-header text-left px-5 py-3">Check Out</th>
                <th className="table-header text-left px-5 py-3">Duration</th>
                <th className="table-header text-left px-5 py-3">Method</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.slice(0, 20).map((a: any) => {
                  const checkIn = new Date(a.checkInTime);
                  const checkOut = a.checkOutTime ? new Date(a.checkOutTime) : null;
                  const duration = checkOut
                    ? `${Math.round((checkOut.getTime() - checkIn.getTime()) / 60000)} min`
                    : "—";
                  return (
                    <tr key={a._id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="table-cell px-5 text-foreground font-medium text-xs">
                        {checkIn.toLocaleDateString("en-IN")}
                      </td>
                      <td className="table-cell px-5 text-muted-foreground text-xs">
                        {checkIn.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="table-cell px-5 text-muted-foreground text-xs">
                        {checkOut ? checkOut.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="table-cell px-5 text-muted-foreground text-xs">{duration}</td>
                      <td className="table-cell px-5">
                        <span className="badge-pending capitalize text-xs">{a.method}</span>
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
