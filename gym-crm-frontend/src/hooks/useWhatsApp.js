import toast from 'react-hot-toast';
import { useGenerateMessageMutation } from '../api/whatsappApi';

// Generates the message server-side (so it's logged as a follow-up) and
// opens the wa.me link in a new tab for a one-click send - no WhatsApp
// Business API needed.
export const useWhatsApp = () => {
  const [generateMessage, { isLoading }] = useGenerateMessageMutation();

  const send = async ({ memberId, leadId, messageType, customMessage }) => {
    try {
      const res = await generateMessage({ memberId, leadId, messageType, customMessage }).unwrap();
      window.open(res.data.whatsappLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not generate WhatsApp message');
    }
  };

  return { send, isLoading };
};
