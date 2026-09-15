import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const Select = forwardRef(({ className, label, error, children, id, ...props }, ref) => {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 pr-9 text-base text-ink-900 sm:text-sm',
            'focus:border-brand focus:ring-2 focus:ring-brand-100 focus:outline-none transition-colors',
            error && 'border-rose',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
