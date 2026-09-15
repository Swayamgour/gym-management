import { cn } from '../../utils/cn';

const tones = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-50 text-brand-700',
  mint: 'bg-mint-50 text-mint-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600'
};

const Badge = ({ tone = 'neutral', className, children }) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}>
    {children}
  </span>
);

export default Badge;
