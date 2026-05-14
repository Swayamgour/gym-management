import { useState } from "react";
import { useGetTrainersQuery, useCreateTrainerMutation } from "../store/gymApi";
import { Plus, X, Star, Users, Dumbbell } from "lucide-react";

function AddTrainerModal({ onClose }: { onClose: () => void }) {
  const [createTrainer, { isLoading }] = useCreateTrainerMutation();
  const [form, setForm] = useState({
    userId: "", specialization: [] as string[], experience: "",
    qualification: "", salary: "", schedule: {}
  });

  const specs = ["weight_loss", "muscle_gain", "cardio", "yoga", "crossfit"];

  const toggleSpec = (spec: string) => {
    setForm(f => ({
      ...f,
      specialization: f.specialization.includes(spec)
        ? f.specialization.filter(s => s !== spec)
        : [...f.specialization, spec]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrainer({ ...form, experience: Number(form.experience), salary: Number(form.salary) }).unwrap();
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to add trainer");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Add Trainer</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Experience (years)</label>
              <input type="number" value={form.experience} onChange={(e) => setForm(f => ({ ...f, experience: e.target.value }))} className="input-field" placeholder="3" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Salary (₹/month) *</label>
              <input type="number" value={form.salary} onChange={(e) => setForm(f => ({ ...f, salary: e.target.value }))} className="input-field" placeholder="25000" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Qualification</label>
            <input value={form.qualification} onChange={(e) => setForm(f => ({ ...f, qualification: e.target.value }))} className="input-field" placeholder="B.Sc Sports Science" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Specialization</label>
            <div className="flex flex-wrap gap-2">
              {specs.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${form.specialization.includes(spec) ? "bg-primary/20 border-primary/50 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  {spec.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">
              {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Add Trainer"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TrainersPage() {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useGetTrainersQuery(undefined);
  const trainers = data?.trainers || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Trainers</h1>
          <p className="text-sm text-muted-foreground mt-1">{trainers.length} trainers registered</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Add Trainer
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-secondary rounded-lg mb-3" />
              <div className="h-4 bg-secondary rounded mb-2" />
              <div className="h-3 bg-secondary rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : trainers.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <Dumbbell size={28} className="text-white" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No trainers yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first trainer to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={14} />
            Add Trainer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((t: any) => (
            <div key={t._id} className="card hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {t.userId?.name?.charAt(0) || "T"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{t.userId?.name || "Trainer"}</h3>
                  <p className="text-xs text-muted-foreground truncate">{t.userId?.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-muted-foreground">{t.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="text-foreground font-medium">{t.experience || 0} years</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="text-foreground font-medium">₹{t.salary?.toLocaleString("en-IN")}/mo</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Members</span>
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Users size={11} />
                    {t.assignedMembers?.length || 0}
                  </span>
                </div>
              </div>

              {t.specialization?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {t.specialization.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs capitalize">
                      {s.replace("_", " ")}
                    </span>
                  ))}
                </div>
              )}

              {t.qualification && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{t.qualification}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && <AddTrainerModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
