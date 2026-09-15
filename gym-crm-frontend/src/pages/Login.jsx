import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useLoginMutation } from '../api/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form).unwrap();
      dispatch(setCredentials(res.data));
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="relative hidden w-1/2 flex-col justify-between bg-ink-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand">
            <Dumbbell size={18} />
          </div>
          <span className="font-display text-lg font-semibold">PeakForm</span>
        </div>
        <div className="max-w-sm">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Run your gym floor from one screen.
          </h1>
          <p className="mt-3 text-sm text-ink-300">
            Members, attendance, payments and renewals — one dashboard tells you exactly who needs a call today.
          </p>
        </div>
        <p className="text-xs text-ink-400">PeakForm CRM &copy; {new Date().getFullYear()}</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              <Dumbbell size={18} />
            </div>
            <span className="font-display text-lg font-semibold text-ink-900">PeakForm</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink-900">Log in</h2>
          <p className="mt-1 text-sm text-ink-400">Enter your details to access your gym's dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="owner@yourgym.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full" loading={isLoading}>
              Log in <ArrowRight size={16} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            New to PeakForm?{' '}
            <Link to="/register" className="font-medium text-brand hover:text-brand-600">
              Set up your gym
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
