import { NavLink } from 'react-router-dom';
import Modal from '../ui/Modal';

const MoreSheet = ({ open, onClose, items }) => (
  <Modal open={open} onClose={onClose} title="More" maxWidth="max-w-sm">
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 py-4 text-xs font-medium text-ink-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </div>
  </Modal>
);

export default MoreSheet;
