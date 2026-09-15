import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useCreateMemberMutation, useUpdateMemberMutation } from '../../api/memberApi';
import { useGetTrainersQuery } from '../../api/trainerApi';
import { useGetPackagesQuery } from '../../api/packageApi';
import { useAssignOrRenewMembershipMutation } from '../../api/membershipApi';

const emptyForm = { name: '', mobile: '', email: '', gender: 'male', dob: '', address: '', emergencyContact: '', trainer: '' };
const emptyMembership = { packageId: '', amount: '', initialPayment: '', paymentMethod: 'cash' };

const MemberFormModal = ({ open, onClose, member }) => {
  const [form, setForm] = useState(emptyForm);
  // Only asked when adding a brand-new member — someone who already has a
  // membership renews it separately from the member's profile page instead.
  const [membershipForm, setMembershipForm] = useState(emptyMembership);

  const [createMember, { isLoading: creating }] = useCreateMemberMutation();
  const [updateMember, { isLoading: updating }] = useUpdateMemberMutation();
  const [assignOrRenew, { isLoading: assigning }] = useAssignOrRenewMembershipMutation();
  const { data: trainersRes } = useGetTrainersQuery();
  const { data: packagesRes } = useGetPackagesQuery({ isActive: true });
  const trainers = trainersRes?.data?.trainers || [];
  const packages = packagesRes?.data?.packages || [];

  const isNewMember = !member;

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        mobile: member.mobile || '',
        email: member.email || '',
        gender: member.gender || 'male',
        dob: member.dob ? member.dob.substring(0, 10) : '',
        address: member.address || '',
        emergencyContact: member.emergencyContact || '',
        trainer: member.trainer?._id || ''
      });
    } else {
      setForm(emptyForm);
      setMembershipForm(emptyMembership);
    }
  }, [member, open]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handlePackageChange = (e) => {
    const pkg = packages.find((p) => p._id === e.target.value);
    setMembershipForm({ ...membershipForm, packageId: e.target.value, amount: pkg ? pkg.price : '' });
  };

  const pending = Math.max((Number(membershipForm.amount) || 0) - (Number(membershipForm.initialPayment) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (member) {
        await updateMember({ id: member._id, ...form }).unwrap();
        toast.success('Member updated');
      } else {
        const res = await createMember(form).unwrap();
        const newMemberId = res?.data?.member?._id;

        if (newMemberId && membershipForm.packageId) {
          await assignOrRenew({
            memberId: newMemberId,
            packageId: membershipForm.packageId,
            amount: Number(membershipForm.amount),
            initialPayment: membershipForm.initialPayment ? Number(membershipForm.initialPayment) : 0,
            paymentMethod: membershipForm.paymentMethod
          }).unwrap();
        }
        toast.success('Member added');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={member ? 'Edit member' : 'Add member'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" required value={form.name} onChange={update('name')} placeholder="Priya Verma" />
          <Input label="Mobile number" required value={form.mobile} onChange={update('mobile')} placeholder="98765 43210" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" value={form.email} onChange={update('email')} placeholder="Optional" />
          <Select label="Gender" value={form.gender} onChange={update('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Date of birth" type="date" value={form.dob} onChange={update('dob')} />
          <Input label="Emergency contact" value={form.emergencyContact} onChange={update('emergencyContact')} placeholder="Optional" />
        </div>
        <Input label="Address" value={form.address} onChange={update('address')} placeholder="Optional" />
        <Select label="Assign trainer (optional)" value={form.trainer} onChange={update('trainer')}>
          <option value="">No trainer</option>
          {trainers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </Select>

        {/* A member who already has a membership renews it from their profile
            page instead — so this section only shows up while creating someone new. */}
        {isNewMember && (
          <div className="border-t border-ink-100 pt-4">
            <p className="mb-3 text-sm font-medium text-ink-700">Membership (optional)</p>
            <Select label="Package" value={membershipForm.packageId} onChange={handlePackageChange}>
              <option value="">Assign later</option>
              {packages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} · {p.durationInDays} days · ₹{p.price}
                </option>
              ))}
            </Select>

            {membershipForm.packageId && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Amount charged (₹)"
                    type="number"
                    min="0"
                    required
                    value={membershipForm.amount}
                    onChange={(e) => setMembershipForm({ ...membershipForm, amount: e.target.value })}
                  />
                  <Select
                    label="Payment method"
                    value={membershipForm.paymentMethod}
                    onChange={(e) => setMembershipForm({ ...membershipForm, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <Input
                  label="Amount paid now (₹)"
                  type="number"
                  min="0"
                  value={membershipForm.initialPayment}
                  onChange={(e) => setMembershipForm({ ...membershipForm, initialPayment: e.target.value })}
                  hint={`Pending after this payment: ₹${pending}`}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={creating || updating || assigning}>
            {member ? 'Save changes' : 'Add member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MemberFormModal;
