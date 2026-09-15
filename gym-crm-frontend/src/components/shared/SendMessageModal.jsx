import { useState } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useWhatsApp } from '../../hooks/useWhatsApp';

const messageOptions = [
  { value: 'expiry', label: 'Membership expiring' },
  { value: 'payment_pending', label: 'Payment pending' },
  { value: 'welcome', label: 'Welcome message' },
  { value: 'absent', label: "Haven't seen them lately" },
  { value: 'renewal', label: 'Renewal confirmation' },
  { value: 'custom', label: 'Custom message' }
];

const SendMessageModal = ({ open, onClose, memberId, leadId }) => {
  const [messageType, setMessageType] = useState('expiry');
  const [customMessage, setCustomMessage] = useState('');
  const { send, isLoading } = useWhatsApp();

  const handleSend = async () => {
    await send({ memberId, leadId, messageType, customMessage: messageType === 'custom' ? customMessage : undefined });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Send WhatsApp message" maxWidth="max-w-sm">
      <div className="space-y-4">
        <Select label="Message type" value={messageType} onChange={(e) => setMessageType(e.target.value)}>
          {messageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        {messageType === 'custom' && (
          <Textarea
            label="Message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Type your message..."
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSend} loading={isLoading}>
            Open in WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SendMessageModal;
