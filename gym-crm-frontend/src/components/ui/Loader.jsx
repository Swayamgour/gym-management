import { Loader2 } from 'lucide-react';

const Loader = ({ label = 'Loading...', fullHeight }) => (
  <div className={`flex flex-col items-center justify-center gap-2 py-16 text-ink-400 ${fullHeight ? 'min-h-[50vh]' : ''}`}>
    <Loader2 className="animate-spin" size={22} />
    <p className="text-sm">{label}</p>
  </div>
);

export default Loader;
