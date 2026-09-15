import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Textarea = forwardRef(({ className, label, error, id, rows = 3, ...props }, ref) => {
  const areaId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        className={cn(
          'w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-base text-ink-900 sm:text-sm',
          'placeholder:text-ink-300 focus:border-brand focus:ring-2 focus:ring-brand-100 focus:outline-none transition-colors',
          error && 'border-rose',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
