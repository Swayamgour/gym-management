import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useCreateLeadMutation, useUpdateLeadMutation } from '../../api/leadApi';
import { useGetPackagesQuery } from '../../api/packageApi';

const emptyForm = { name: '', mobile: '', interestedPackage: '', followUpDate: '', status: 'new', notes: '' };

const LeadFormModal = ({ open, onClose, lead }) => {
  const [form, setForm] = useState(emptyForm);
  const { data: packagesRes } = useGetPackagesQuery({ isActive: true });
  const packages = packagesRes?.data?.packages || [];
  const [createLead, { isLoading: creating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: updating }] = useUpdateLeadMutation();

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        mobile: lead.mobile || '',
        interestedPackage: lead.interestedPackage?._id || '',
        followUpDate: lead.followUpDate ? lead.followUpDate.substring(0, 10) : '',
        status: lead.status || 'new',
        notes: lead.notes || ''
      });
    } else {
      setForm(emptyForm);
    }
  }, [lead, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (lead) {
        await updateLead({ id: lead._id, ...form }).unwrap();
        toast.success('Lead updated');
      } else {
        await createLead(form).unwrap();
        toast.success('Lead added');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={lead ? 'Edit lead' : 'New enquiry'} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Mobile" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </div>
        <Select label="Interested package" value={form.interestedPackage} onChange={(e) => setForm({ ...form, interestedPackage: e.target.value })}>
          <option value="">Not sure yet</option>
          {packages.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Follow-up date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="new">New</option>
            <option value="follow-up">Follow-up</option>
            <option value="trial">Trial</option>
            <option value="not-interested">Not interested</option>
          </Select>
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What are they looking for?" />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={creating || updating}>
            {lead ? 'Save changes' : 'Add lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadFormModal;
