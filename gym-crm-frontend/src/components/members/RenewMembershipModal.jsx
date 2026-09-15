import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useGetPackagesQuery } from '../../api/packageApi';
import { useAssignOrRenewMembershipMutation } from '../../api/membershipApi';

const RenewMembershipModal = ({ open, onClose, member }) => {
  const { data: packagesRes } = useGetPackagesQuery({ isActive: true });
  const packages = packagesRes?.data?.packages || [];
  const [assignOrRenew, { isLoading }] = useAssignOrRenewMembershipMutation();

  const [form, setForm] = useState({ packageId: '', amount: '', initialPayment: '', paymentMethod: 'cash', startDate: '' });

  useEffect(() => {
    if (open) setForm({ packageId: '', amount: '', initialPayment: '', paymentMethod: 'cash', startDate: '' });
  }, [open]);

  const selectedPackage = packages.find((p) => p._id === form.packageId);

  const handlePackageChange = (e) => {
    const pkg = packages.find((p) => p._id === e.target.value);
    setForm({ ...form, packageId: e.target.value, amount: pkg ? pkg.price : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.packageId) return toast.error('Choose a package');
    try {
      await assignOrRenew({
        memberId: member._id,
        packageId: form.packageId,
        amount: Number(form.amount),
        initialPayment: form.initialPayment ? Number(form.initialPayment) : 0,
        paymentMethod: form.paymentMethod,
        startDate: form.startDate || undefined
      }).unwrap();
      toast.success(member.currentMembership ? 'Membership renewed' : 'Membership assigned');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Could not save membership');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={member?.currentMembership ? 'Renew membership' : 'Assign a package'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Package" required value={form.packageId} onChange={handlePackageChange}>
          <option value="">Select a package</option>
          {packages.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} · {p.durationInDays} days · ₹{p.price}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Amount charged (₹)"
            type="number"
            min="0"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Amount paid now (₹)"
            type="number"
            min="0"
            value={form.initialPayment}
            onChange={(e) => setForm({ ...form, initialPayment: e.target.value })}
            hint={selectedPackage ? `Pending stays as ₹${(form.amount || 0) - (form.initialPayment || 0)}` : undefined}
          />
          <Select label="Payment method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="online">Online</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Confirm
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RenewMembershipModal;
