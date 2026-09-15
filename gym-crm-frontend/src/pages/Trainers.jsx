import { useNavigate } from 'react-router-dom';
import { Dumbbell, Plus } from 'lucide-react';
import { useGetTrainersQuery } from '../api/trainerApi';
import { useCreateStaffMutation } from '../api/authApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const Trainers = () => {
  const { data, isLoading } = useGetTrainersQuery();
  const [createStaff, { isLoading: creating }] = useCreateStaffMutation();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', specialization: '' });
  const navigate = useNavigate();

  const trainers = data?.data?.trainers || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStaff({ ...form, role: 'trainer' }).unwrap();
      toast.success('Trainer added');
      setFormOpen(false);
      setForm({ name: '', email: '', phone: '', password: '', specialization: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Could not add trainer');
    }
  };

  if (isLoading) return <Loader fullHeight />;

  return (
    <div>
      <PageHeader
        title="Trainers"
        description="Optional — assign trainers to members, or leave everyone unassigned and manage them yourself."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Add trainer
          </Button>
        }
      />

      {trainers.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No trainers yet"
          description="That's fine — members without a trainer are managed directly by you. Add a trainer whenever you're ready."
          actionLabel="Add trainer"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((t) => (
            <div
              key={t._id}
              onClick={() => navigate(`/trainers/${t._id}`)}
              className="cursor-pointer rounded-xl2 bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <Avatar name={t.name} size={44} />
                <div>
                  <p className="font-medium text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-400">{t.specialization || 'Trainer'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="text-sm text-ink-500">Members</span>
                <span className="font-display text-lg font-semibold text-ink-900">{t.memberCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add trainer" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Strength & conditioning" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Input label="Temporary password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Add trainer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Trainers;
