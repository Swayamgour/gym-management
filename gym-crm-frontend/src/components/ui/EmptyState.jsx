import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-200 bg-white/50 px-6 py-14 text-center">
    {Icon && (
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        <Icon size={20} />
      </div>
    )}
    <p className="font-medium text-ink-700">{title}</p>
    {description && <p className="mt-1 max-w-xs text-sm text-ink-400">{description}</p>}
    {actionLabel && (
      <Button className="mt-4" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
