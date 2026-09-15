import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNavForRole } from './navConfig';
import { useAuth } from '../../hooks/useAuth';
import MoreSheet from './MoreSheet';

const MAX_PRIMARY = 4;

const BottomNav = () => {
  const { role } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const items = getNavForRole(role);
  const primary = items.filter((i) => i.primary).slice(0, MAX_PRIMARY);
  const overflow = items.filter((i) => !primary.includes(i));

  return (
    <>
      <nav
        className="fixed inset-x-3 bottom-3 z-30 flex items-stretch justify-around rounded-2xl border border-ink-100 bg-white/95 px-1 py-1.5 shadow-[0_8px_30px_-8px_rgba(23,27,38,0.25)] backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      >
        {primary.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                    isActive ? 'bg-brand text-white shadow-sm shadow-brand-900/20' : 'text-ink-400'
                  )}
                >
                  <Icon size={18} />
                </span>
                <span className={isActive ? 'text-ink-900' : 'text-ink-400'}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {overflow.length > 0 && (
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-ink-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full">
              <MoreHorizontal size={18} />
            </span>
            More
          </button>
        )}
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} items={overflow} />
    </>
  );
};

export default BottomNav;
