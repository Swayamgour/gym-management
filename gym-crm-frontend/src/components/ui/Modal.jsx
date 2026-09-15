import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, description, children, maxWidth = 'max-w-lg' }) => {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel
              className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white p-5 pt-3 sm:p-6 shadow-xl`}
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-100 sm:hidden" aria-hidden="true" />
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  {title && <Dialog.Title className="text-lg font-semibold text-ink-900">{title}</Dialog.Title>}
                  {description && <Dialog.Description className="mt-1 text-sm text-ink-400">{description}</Dialog.Description>}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
