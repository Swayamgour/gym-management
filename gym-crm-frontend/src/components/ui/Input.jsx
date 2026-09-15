import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ className, label, error, hint, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-base text-ink-900 sm:text-sm',
          'placeholder:text-ink-300 transition-colors',
          'focus:border-brand focus:ring-2 focus:ring-brand-100 focus:outline-none',
          error && 'border-rose focus:border-rose focus:ring-rose-50',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
