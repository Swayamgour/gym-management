const axios = require('axios');

// Default message templates matching the CRM's follow-up requirements.
// Gym owners can override any of these via /api/v1/whatsapp/templates/:type
const DEFAULT_TEMPLATES = {
  welcome: 'Welcome to our gym, {{name}}! Your membership has been successfully activated.',
  expiry: 'Hi {{name}}, your gym membership is expiring on {{expiryDate}}. Please renew your membership to continue your gym access.',
  payment_pending: 'Hi {{name}}, your gym payment of Rs.{{amount}} is pending. Please complete the payment at your convenience.',
  absent: "Hi {{name}}, we haven't seen you at the gym recently. Hope everything is okay. Keep going!",
  renewal: 'Hi {{name}}, your membership has been renewed successfully. Thank you for choosing us.',
  custom: '{{message}}'
};

const fillTemplate = (template, data = {}) => {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    return data[key] !== undefined && data[key] !== null ? data[key] : '';
  });
};

const normalizeMobile = (mobile, defaultCountryCode = '91') => {
  const digits = String(mobile).replace(/\D/g, '');
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  return digits;
};

const buildWhatsAppLink = (mobile, message) => {
  const normalized = normalizeMobile(mobile);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

const isCloudApiConfigured = () => {
  return Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_API_URL
  );
};

// Sends via Meta's WhatsApp Cloud API. Only called when autoSend=true AND
// the gym owner has configured API credentials in .env - otherwise the
// system falls back to a click-to-chat wa.me link (no external API needed).
const sendViaCloudApi = async (mobile, message) => {
  const normalized = normalizeMobile(mobile);
  const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const response = await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to: normalized,
      type: 'text',
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

module.exports = {
  DEFAULT_TEMPLATES,
  fillTemplate,
  normalizeMobile,
  buildWhatsAppLink,
  isCloudApiConfigured,
  sendViaCloudApi
};
