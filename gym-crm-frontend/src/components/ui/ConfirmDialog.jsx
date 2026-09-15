import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', danger, loading }) => {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} maxWidth="max-w-sm">
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
