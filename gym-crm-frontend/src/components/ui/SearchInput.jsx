import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative w-full sm:w-64">
    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-9 pr-4 text-base text-ink-900 sm:text-sm placeholder:text-ink-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
    />
  </div>
);

export default SearchInput;
