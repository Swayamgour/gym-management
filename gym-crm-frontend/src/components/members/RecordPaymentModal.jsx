import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useRecordPaymentMutation } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/format';

const RecordPaymentModal = ({ open, onClose, member, membership }) => {
  const [recordPayment, { isLoading }] = useRecordPaymentMutation();
  const pending = membership ? membership.amount - membership.paidAmount : 0;
  const [form, setForm] = useState({ amount: '', method: 'cash', note: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await recordPayment({
        memberId: member._id,
        membershipId: membership._id,
        amount: Number(form.amount),
        method: form.method,
        note: form.note
      }).unwrap();
      toast.success('Payment recorded');
      setForm({ amount: '', method: 'cash', note: '' });
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Could not record payment');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record payment" description={`Pending balance: ${formatCurrency(pending)}`} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount (₹)"
          type="number"
          min="1"
          max={pending}
          required
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <Select label="Payment method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="online">Online</option>
          <option value="other">Other</option>
        </Select>
        <Input label="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Record payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
