import { useState } from 'react';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { useChangePasswordMutation } from '../api/authApi';

const roleLabels = { owner: 'Owner', manager: 'Manager', trainer: 'Trainer', receptionist: 'Receptionist' };

const Profile = () => {
  const { user } = useAuth();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(form).unwrap();
      toast.success('Password changed');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Could not change password');
    }
  };

  return (
    <div>
      <PageHeader title="My profile" />

      <div className="max-w-lg space-y-5">
        <div className="flex items-center gap-4 rounded-xl2 bg-white p-5 shadow-soft">
          <Avatar name={user?.name} size={56} />
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">{user?.name}</p>
            <p className="text-sm text-ink-400">{user?.email}</p>
            <Badge tone="brand" className="mt-1.5">
              {roleLabels[user?.role] || user?.role}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 bg-white p-5 shadow-soft sm:p-6">
          <p className="text-sm font-medium text-ink-700">Change password</p>
          <Input
            label="Current password"
            type="password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={6}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <Button type="submit" loading={isLoading}>
            <KeyRound size={15} /> Update password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
