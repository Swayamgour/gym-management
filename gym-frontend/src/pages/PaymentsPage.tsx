import { useState } from "react";
import {
  useGetPaymentsQuery, useCreatePaymentMutation,
  useGetPendingPaymentsQuery, useGetMembersQuery, useGetPlansQuery
} from "../store/gymApi";
import { Plus, X, IndianRupee, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function AddPaymentModal({ onClose }: { onClose: () => void }) {
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const { data: membersData } = useGetMembersQuery(undefined);
  const { data: plansData } = useGetPlansQuery(undefined);
  const members = membersData?.members || [];
  const plans = plansData?.plans || [];

  const [form, setForm] = useState({
    memberId: "", planId: "", amount: "", paymentMethod: "cash",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "", notes: ""
  });

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plan = plans.find((p: any) => p._id === e.target.value);
    if (plan) {
      const from = new Date(form.validFrom);
      const to = new Date(from);
      to.setDate(to.getDate() + plan.duration);
      setForm(f => ({
        ...f, planId: plan._id, amount: String(plan.price),
        validTo: to.toISOString().split("T")[0]
      }));
    } else {
      setForm(f => ({ ...f, planId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment({ ...form, amount: Number(form.amount) }).unwrap();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Record Payment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Member *</label>
            <select value={form.memberId} onChange={(e) => setForm(f => ({ ...f, memberId: e.target.value }))} className="input-field" required>
              <option value="">Select member</option>
              {members.map((m: any) => <option key={m._id} value={m._id}>{m.name} — {m.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Plan *</label>
            <select value={form.planId} onChange={handlePlanChange} className="input-field" required>
              <option value="">Select plan</option>
              {plans.map((p: any) => <option key={p._id} value={p._id}>{p.name} — ₹{p.price} ({p.duration} days)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Method *</label>
              <select value={form.paymentMethod} onChange={(e) => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input-field">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Valid From *</label>
              <input type="date" value={form.validFrom} onChange={(e) => setForm(f => ({ ...f, validFrom: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Valid To *</label>
              <input type="date" value={form.validTo} onChange={(e) => setForm(f => ({ ...f, validTo: e.target.value }))} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none h-16" placeholder="Optional notes..." />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Record Payment"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">₹{payload[0].value?.toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

const METHOD_COLORS: Record<string, string> = {
  cash: "badge-active", upi: "badge-pending", card: "badge-expired", bank_transfer: "badge-pending"
};

export default function PaymentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<"all" | "pending">("all");

  const { data: paymentsData, isLoading } = useGetPaymentsQuery(undefined);
  const { data: pendingData } = useGetPendingPaymentsQuery(undefined);

  const payments = paymentsData?.payments || [];
  const pending = pendingData?.pending || [];
  const totalRevenue = paymentsData?.totalRevenue || 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track revenue and memberships</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-4">
          <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center">
            <IndianRupee size={20} className="text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-11 h-11 gradient-success rounded-xl flex items-center justify-center">
            <CheckCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-foreground">{payments.length}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-11 h-11 gradient-warning rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Pending Renewals</p>
            <p className="text-2xl font-bold text-foreground">{pending.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary rounded-lg p-1 w-fit gap-1">
        {[{ key: "all", label: "All Payments" }, { key: "pending", label: "Pending Renewals" }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "all" ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="table-header text-left px-4 py-3">Invoice</th>
                  <th className="table-header text-left px-4 py-3">Member</th>
                  <th className="table-header text-left px-4 py-3">Plan</th>
                  <th className="table-header text-left px-4 py-3">Amount</th>
                  <th className="table-header text-left px-4 py-3">Method</th>
                  <th className="table-header text-left px-4 py-3">Date</th>
                  <th className="table-header text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground text-sm">No payments found</td></tr>
                ) : (
                  payments.map((p: any) => (
                    <tr key={p._id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="table-cell px-4 text-xs text-primary font-mono">{p.invoiceNumber}</td>
                      <td className="table-cell px-4 font-medium">{p.memberId?.name || "—"}</td>
                      <td className="table-cell px-4 text-muted-foreground text-xs">{p.planId?.name || "—"}</td>
                      <td className="table-cell px-4 font-semibold text-foreground">₹{p.amount?.toLocaleString("en-IN")}</td>
                      <td className="table-cell px-4">
                        <span className="badge-pending capitalize">{p.paymentMethod?.replace("_", " ")}</span>
                      </td>
                      <td className="table-cell px-4 text-muted-foreground text-xs">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="table-cell px-4">
                        <span className={p.status === "paid" ? "badge-active" : p.status === "pending" ? "badge-pending" : "badge-expired"}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="table-header text-left px-4 py-3">Member</th>
                  <th className="table-header text-left px-4 py-3">Phone</th>
                  <th className="table-header text-left px-4 py-3">Plan</th>
                  <th className="table-header text-left px-4 py-3">Expiry Date</th>
                  <th className="table-header text-left px-4 py-3">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground text-sm">No pending renewals</td></tr>
                ) : (
                  pending.map((m: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="table-cell px-4 font-medium">{m.name}</td>
                      <td className="table-cell px-4 text-muted-foreground">{m.phone}</td>
                      <td className="table-cell px-4 text-muted-foreground text-xs">{m.planName || "—"}</td>
                      <td className="table-cell px-4 text-muted-foreground text-xs">{new Date(m.expiryDate).toLocaleDateString("en-IN")}</td>
                      <td className="table-cell px-4">
                        <span className={`text-xs font-semibold ${m.daysLeft < 0 ? "text-destructive" : m.daysLeft <= 3 ? "text-red-400" : "text-yellow-400"}`}>
                          {m.daysLeft < 0 ? `${Math.abs(m.daysLeft)}d overdue` : `${m.daysLeft}d`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <AddPaymentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
