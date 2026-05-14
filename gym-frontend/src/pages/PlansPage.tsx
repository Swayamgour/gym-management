import { useState } from "react";
import { useGetPlansQuery, useCreatePlanMutation } from "../store/gymApi";
import { Plus, X, Check, ClipboardList } from "lucide-react";

function AddPlanModal({ onClose }: { onClose: () => void }) {
  const [createPlan, { isLoading }] = useCreatePlanMutation();
  const [form, setForm] = useState({
    name: "", duration: "", durationType: "days" as "days" | "months" | "years",
    price: "", discountPrice: "", features: [""]
  });

  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, ""] }));
  const updateFeature = (i: number, val: string) =>
    setForm(f => ({ ...f, features: f.features.map((feat, idx) => idx === i ? val : feat) }));
  const removeFeature = (i: number) =>
    setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlan({
        ...form,
        duration: Number(form.duration),
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        features: form.features.filter(Boolean)
      }).unwrap();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create plan");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Create New Plan</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Plan Name *</label>
            <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Premium Monthly" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Duration *</label>
              <input type="number" value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} className="input-field" placeholder="30" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Duration Type</label>
              <select value={form.durationType} onChange={(e) => setForm(f => ({ ...f, durationType: e.target.value as any }))} className="input-field">
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="999" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Discount Price (₹)</label>
              <input type="number" value={form.discountPrice} onChange={(e) => setForm(f => ({ ...f, discountPrice: e.target.value }))} className="input-field" placeholder="799" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Features</label>
              <button type="button" onClick={addFeature} className="text-xs text-primary hover:underline">+ Add</button>
            </div>
            <div className="space-y-2">
              {form.features.map((feat, i) => (
                <div key={i} className="flex gap-2">
                  <input value={feat} onChange={(e) => updateFeature(i, e.target.value)} className="input-field flex-1" placeholder={`Feature ${i + 1}`} />
                  {form.features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(i)} className="p-2 text-muted-foreground hover:text-destructive">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Plan"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PLAN_GRADIENTS = ["gradient-primary", "gradient-success", "gradient-warning", "gradient-destructive"];

export default function PlansPage() {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useGetPlansQuery(undefined);
  const plans = data?.plans || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Membership Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">{plans.length} active plans</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Create Plan
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-24 bg-secondary rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded" />
                <div className="h-3 bg-secondary rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-white" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No plans yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first membership plan</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={14} />
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan: any, idx: number) => (
            <div key={plan._id} className="card relative overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10">
              {/* Gradient header */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${PLAN_GRADIENTS[idx % PLAN_GRADIENTS.length]}`} />

              <div className="pt-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.duration} {plan.durationType}
                    </p>
                  </div>
                  <span className={`${plan.isActive ? "badge-active" : "badge-expired"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">₹{plan.price?.toLocaleString("en-IN")}</span>
                    {plan.discountPrice > 0 && (
                      <span className="text-sm text-muted-foreground line-through">₹{plan.discountPrice?.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">per {plan.durationType.slice(0, -1)}</p>
                </div>

                {plan.features?.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    {plan.features.map((feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                          <Check size={10} className="text-green-400" />
                        </div>
                        <span className="text-xs text-muted-foreground">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddPlanModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
