import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetMembersQuery, useCreateMemberMutation, useDeleteMemberMutation, useGetPlansQuery
} from "../store/gymApi";
import { Plus, Search, Eye, Trash2, X, Filter, UserCheck, UserX, Users } from "lucide-react";

type Filter = "all" | "active" | "expired";

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const [createMember, { isLoading }] = useCreateMemberMutation();
  const { data: plansData } = useGetPlansQuery(undefined);
  const plans = plansData?.plans || [];

  const [form, setForm] = useState({
    name: "", phone: "", email: "", age: "", gender: "male",
    planId: "", branchId: "000000000000000000000001",
    address: { street: "", city: "", state: "", pincode: "" },
    emergencyContact: { name: "", phone: "", relation: "" },
    medicalConditions: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      setForm(f => ({ ...f, address: { ...f.address, [name.split(".")[1]]: value } }));
    } else if (name.startsWith("ec.")) {
      setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [name.split(".")[1]]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMember({ ...form, age: Number(form.age) }).unwrap();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to add member");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Add New Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91XXXXXXXXXX" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Age *</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} className="input-field" placeholder="25" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Plan *</label>
              <select name="planId" value={form.planId} onChange={handleChange} className="input-field" required>
                <option value="">Select plan</option>
                {plans.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">City</label>
              <input name="address.city" value={form.address.city} onChange={handleChange} className="input-field" placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">State</label>
              <input name="address.state" value={form.address.state} onChange={handleChange} className="input-field" placeholder="Maharashtra" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Medical Conditions</label>
            <textarea name="medicalConditions" value={form.medicalConditions} onChange={handleChange} className="input-field resize-none h-20" placeholder="Any known medical conditions..." />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : "Add Member"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch } = useGetMembersQuery({ status: filter === "all" ? undefined : filter });
  const [deleteMember] = useDeleteMemberMutation();

  const members = (data?.members || []).filter((m: any) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteMember(id).unwrap();
    } catch {
      alert("Failed to delete member");
    }
  };

  const filterTabs: { key: Filter; label: string; icon: any }[] = [
    { key: "all", label: "All", icon: Users },
    { key: "active", label: "Active", icon: UserCheck },
    { key: "expired", label: "Expired", icon: UserX },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">{data?.count ?? 0} members total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-secondary rounded-lg p-1 gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === tab.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2"
            placeholder="Search members..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="table-header text-left px-4 py-3">Member</th>
                <th className="table-header text-left px-4 py-3">Phone</th>
                <th className="table-header text-left px-4 py-3">Plan</th>
                <th className="table-header text-left px-4 py-3">Expiry</th>
                <th className="table-header text-left px-4 py-3">Status</th>
                <th className="table-header text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-secondary rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground text-sm">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m: any) => {
                  const isActive = m.isActive && new Date(m.expiryDate) > new Date();
                  return (
                    <tr key={m._id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="table-cell px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {m.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{m.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell px-4 text-muted-foreground">{m.phone}</td>
                      <td className="table-cell px-4 text-foreground text-xs">{m.planId?.name || "—"}</td>
                      <td className="table-cell px-4 text-muted-foreground text-xs">
                        {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="table-cell px-4">
                        <span className={isActive ? "badge-active" : "badge-expired"}>
                          {isActive ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className="table-cell px-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/members/${m._id}`} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                            <Eye size={15} />
                          </Link>
                          <button onClick={() => handleDelete(m._id, m.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddMemberModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
