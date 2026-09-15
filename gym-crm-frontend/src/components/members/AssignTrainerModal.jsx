import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useGetTrainersQuery } from '../../api/trainerApi';
import { useAssignTrainerMutation } from '../../api/memberApi';

const AssignTrainerModal = ({ open, onClose, member }) => {
  const { data } = useGetTrainersQuery();
  const trainers = data?.data?.trainers || [];
  const [trainerId, setTrainerId] = useState(member?.trainer?._id || '');
  const [assignTrainer, { isLoading }] = useAssignTrainerMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignTrainer({ id: member._id, trainerId: trainerId || null }).unwrap();
      toast.success('Trainer updated');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Could not update trainer');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign trainer" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Trainer" value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
          <option value="">No trainer</option>
          {trainers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.memberCount} members)
            </option>
          ))}
        </Select>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignTrainerModal;
