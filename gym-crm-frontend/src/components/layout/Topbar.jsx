import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, LogOut, User as UserIcon, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { useGetSettingsQuery } from '../../api/settingsApi';
import { useAuth } from '../../hooks/useAuth';

const roleLabels = {
  owner: 'Owner',
  manager: 'Manager',
  trainer: 'Trainer',
  receptionist: 'Receptionist'
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Topbar = () => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const { data } = useGetSettingsQuery(undefined, { skip: !isOwner });
  const gymName = data?.data?.gym?.name || user?.gym?.name;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white lg:hidden">
          <Dumbbell size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-ink-400 sm:text-sm">{getGreeting()}, {user?.name?.split(' ')[0]}</p>
          <p className="truncate font-display font-semibold leading-tight text-ink-900">{gymName || 'Your gym'}</p>
        </div>
      </div>

      <Menu as="div" className="relative shrink-0">
        <Menu.Button className="flex items-center gap-2 rounded-full border border-ink-100 py-1 pl-1 pr-2 transition-colors hover:bg-ink-50 active:scale-[0.97] sm:pr-2.5">
          <Avatar name={user?.name} size={30} />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight text-ink-900">{user?.name}</p>
            <p className="text-xs leading-tight text-ink-400">{roleLabels[user?.role] || user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-ink-400" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-ink-100 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/profile')}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? 'bg-ink-50' : ''}`}
                >
                  <UserIcon size={15} /> My profile
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 ${active ? 'bg-rose-50' : ''}`}
                >
                  <LogOut size={15} /> Log out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </header>
  );
};

export default Topbar;
