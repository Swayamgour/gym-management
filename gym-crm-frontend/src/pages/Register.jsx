import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useRegisterMutation } from '../api/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';

const initialForm = {
  gymName: '',
  gymPhone: '',
  gymAddress: '',
  name: '',
  email: '',
  phone: '',
  password: ''
};

const Register = () => {
  const [form, setForm] = useState(initialForm);
  const [registerGym, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerGym(form).unwrap();
      dispatch(setCredentials(res.data));
      toast.success('Your gym is set up!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || 'Could not create your account');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
            <Dumbbell size={18} />
          </div>
          <span className="font-display text-lg font-semibold text-ink-900">PeakForm</span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink-900">Set up your gym</h2>
        <p className="mt-1 text-sm text-ink-400">Creates your gym profile and an owner login in one step.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Gym name" required value={form.gymName} onChange={update('gymName')} placeholder="Iron Wolf Fitness" />
            <Input label="Gym phone" value={form.gymPhone} onChange={update('gymPhone')} placeholder="98765 43210" />
          </div>
          <Input label="Gym address" value={form.gymAddress} onChange={update('gymAddress')} placeholder="MG Road, Kanpur" />

          <div className="border-t border-ink-100 pt-4">
            <p className="mb-3 text-sm font-medium text-ink-700">Your owner login</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Your name" required value={form.name} onChange={update('name')} placeholder="Rahul Sharma" />
              <Input label="Phone" value={form.phone} onChange={update('phone')} placeholder="98765 43210" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" required value={form.email} onChange={update('email')} placeholder="you@yourgym.com" />
              <Input
                label="Password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update('password')}
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            Create my gym <ArrowRight size={16} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:text-brand-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
