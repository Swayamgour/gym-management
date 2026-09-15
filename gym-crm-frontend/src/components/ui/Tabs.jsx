import { cn } from '../../utils/cn';

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 overflow-x-auto scrollbar-none rounded-full bg-ink-100 p-1">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        className={cn(
          'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
          active === tab.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn('ml-1.5 text-xs', active === tab.value ? 'text-ink-400' : 'text-ink-400')}>{tab.count}</span>
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
