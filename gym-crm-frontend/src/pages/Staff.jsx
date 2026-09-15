import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { useGetStaffQuery, useCreateStaffMutation, useUpdateStaffMutation } from '../api/authApi';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useAuth } from '../hooks/useAuth';
import { listContainer, listItemStatic } from '../components/ui/listStyles';

const roleTone = { manager: 'brand', trainer: 'mint', receptionist: 'amber' };

const emptyForm = { name: '', email: '', phone: '', password: '', role: 'receptionist' };

const Staff = () => {
  const { data, isLoading } = useGetStaffQuery();
  const [createStaff, { isLoading: creating }] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const { isOwner } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const staff = (data?.data?.staff || []).filter((s) => s.role !== 'owner');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStaff(form).unwrap();
      toast.success('Staff account created');
      setFormOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not create staff account');
    }
  };

  const toggleActive = async (member) => {
    try {
      await updateStaff({ id: member._id, isActive: !member.isActive }).unwrap();
      toast.success(member.isActive ? 'Account deactivated' : 'Account activated');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not update account');
    }
  };

  if (isLoading) return <Loader fullHeight />;

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Managers, trainers, and receptionists who can log into PeakForm."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Add staff
          </Button>
        }
      />

      {staff.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No staff accounts yet" description="Add a manager, trainer, or receptionist to share the workload." actionLabel="Add staff" onAction={() => setFormOpen(true)} />
      ) : (
        <div>
          <ul className={listContainer}>
            {staff.map((s) => (
              <li key={s._id} className={`flex items-center justify-between ${listItemStatic}`}>
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} />
                  <div>
                    <p className="text-sm font-medium text-ink-900">{s.name}</p>
                    <p className="text-xs text-ink-400">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={roleTone[s.role] || 'neutral'}>{s.role}</Badge>
                  {!s.isActive && <Badge tone="rose">Inactive</Badge>}
                  {isOwner && (
                    <button onClick={() => toggleActive(s)} className="text-ink-400 hover:text-ink-700" title={s.isActive ? 'Deactivate' : 'Activate'}>
                      {s.isActive ? <ToggleRight size={22} className="text-mint-600" /> : <ToggleLeft size={22} />}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add staff account" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {isOwner && <option value="manager">Manager</option>}
              <option value="trainer">Trainer</option>
              <option value="receptionist">Receptionist</option>
            </Select>
          </div>
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Temporary password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
