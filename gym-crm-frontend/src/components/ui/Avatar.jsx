import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

const palette = ['bg-brand-100 text-brand-700', 'bg-mint-100 text-mint-600', 'bg-amber-50 text-amber-600', 'bg-ink-100 text-ink-600'];

const pickColor = (name = '') => {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[sum % palette.length];
};

const Avatar = ({ name = '', src, size = 36, className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={cn('flex items-center justify-center rounded-full text-xs font-semibold', pickColor(name), className)}
    >
      {initials(name) || '?'}
    </div>
  );
};

export default Avatar;
