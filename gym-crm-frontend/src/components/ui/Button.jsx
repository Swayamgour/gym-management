import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-600 shadow-sm shadow-brand-900/10',
  dark: 'bg-ink-900 text-white hover:bg-ink-800',
  outline: 'border border-ink-200 text-ink-700 bg-white hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'bg-rose text-white hover:bg-rose-600',
  success: 'bg-mint text-white hover:bg-mint-600'
};

const sizes = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3 gap-2'
};

const Button = forwardRef(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-[0.97]',
          'disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
