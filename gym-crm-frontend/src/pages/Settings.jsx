import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../api/settingsApi';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

const Settings = () => {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (data?.data?.gym) {
      const gym = data.data.gym;
      setForm({
        name: gym.name || '',
        address: gym.address || '',
        phone: gym.phone || '',
        email: gym.email || '',
        currency: gym.settings?.currency || 'INR',
        absentDaysThreshold: gym.settings?.absentDaysThreshold ?? 5,
        whatsappCountryCode: gym.settings?.whatsappCountryCode || '91'
      });
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(form).unwrap();
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not save settings');
    }
  };

  if (isLoading || !form) return <Loader fullHeight />;

  return (
    <div>
      <PageHeader title="Settings" description="Your gym profile and preferences." />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-xl2 bg-white p-5 shadow-soft sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Gym name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <div className="border-t border-ink-100 pt-5">
          <p className="mb-3 text-sm font-medium text-ink-700">Preferences</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </Select>
            <Input
              label="Absent after (days)"
              type="number"
              min="1"
              value={form.absentDaysThreshold}
              onChange={(e) => setForm({ ...form, absentDaysThreshold: Number(e.target.value) })}
              hint="Used for win-back follow-ups"
            />
            <Input
              label="WhatsApp country code"
              value={form.whatsappCountryCode}
              onChange={(e) => setForm({ ...form, whatsappCountryCode: e.target.value })}
              placeholder="91"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving}>
            <Save size={15} /> Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
