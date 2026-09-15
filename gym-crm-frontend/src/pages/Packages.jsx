import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Dumbbell } from 'lucide-react';
import { useGetPackagesQuery, useCreatePackageMutation, useUpdatePackageMutation, useDeletePackageMutation } from '../api/packageApi';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/format';

const emptyForm = { name: '', durationInDays: '', price: '', description: '' };

const Packages = () => {
  const { data, isLoading } = useGetPackagesQuery();
  const [createPackage, { isLoading: creating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: updating }] = useUpdatePackageMutation();
  const [deletePackage] = useDeletePackageMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const packages = data?.data?.packages || [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({ name: pkg.name, durationInDays: pkg.durationInDays, price: pkg.price, description: pkg.description || '' });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, durationInDays: Number(form.durationInDays), price: Number(form.price) };
      if (editing) {
        await updatePackage({ id: editing._id, ...payload }).unwrap();
        toast.success('Package updated');
      } else {
        await createPackage(payload).unwrap();
        toast.success('Package created');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePackage(deleteTarget._id).unwrap();
      toast.success('Package deactivated');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not deactivate package');
    }
  };

  if (isLoading) return <Loader fullHeight />;

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Monthly, quarterly, or yearly plans your gym offers."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> New package
          </Button>
        }
      />

      {packages.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No packages yet" description="Add your first membership package to start assigning it to members." actionLabel="New package" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg._id} className={`rounded-xl2 bg-white p-5 shadow-soft ${!pkg.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-ink-900">{pkg.name}</p>
                  <p className="text-sm text-ink-400">{pkg.durationInDays} days</p>
                </div>
                <p className="font-display text-xl font-semibold text-brand">{formatCurrency(pkg.price)}</p>
              </div>
              {pkg.description && <p className="mt-2 text-sm text-ink-500">{pkg.description}</p>}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(pkg)}>
                  <Pencil size={14} /> Edit
                </Button>
                {pkg.isActive && (
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(pkg)}>
                    <Trash2 size={14} className="text-rose-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit package' : 'New package'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Package name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="6 Months" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (days)"
              type="number"
              min="1"
              required
              value={form.durationInDays}
              onChange={(e) => setForm({ ...form, durationInDays: e.target.value })}
            />
            <Input label="Price (₹)" type="number" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating || updating}>
              {editing ? 'Save changes' : 'Create package'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate this package?"
        description="It will no longer be available to assign, but past memberships keep their history."
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
};

export default Packages;
