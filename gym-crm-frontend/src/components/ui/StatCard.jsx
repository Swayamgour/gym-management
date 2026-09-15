import { cn } from '../../utils/cn';

const accents = {
  brand: { border: 'border-brand', chip: 'bg-brand-50 text-brand-600' },
  mint: { border: 'border-mint', chip: 'bg-mint-50 text-mint-600' },
  amber: { border: 'border-amber', chip: 'bg-amber-50 text-amber-600' },
  rose: { border: 'border-rose', chip: 'bg-rose-50 text-rose-600' },
  ink: { border: 'border-ink-300', chip: 'bg-ink-100 text-ink-500' }
};

const StatCard = ({ label, value, icon: Icon, accent = 'brand', hint }) => {
  const tone = accents[accent];
  return (
    <div
      className={cn(
        'rounded-2xl border-l-4 bg-white p-4 shadow-soft transition-transform active:scale-[0.98] sm:p-5 sm:active:scale-100',
        tone.border
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-ink-400 sm:text-sm">{label}</p>
        {Icon && (
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', tone.chip)}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-2.5 font-display text-xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
};

export default StatCard;
