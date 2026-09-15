import { NavLink } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNavForRole } from './navConfig';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { role } = useAuth();
  const items = getNavForRole(role);

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-ink-900 lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
          <Dumbbell size={18} />
        </div>
        <span className="font-display text-lg font-semibold text-white">PeakForm</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-300' : 'text-ink-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-xs text-ink-400">
        PeakForm CRM &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
};

export default Sidebar;
