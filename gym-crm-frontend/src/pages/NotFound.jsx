import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-400">
      <Dumbbell size={26} />
    </div>
    <h1 className="font-display text-2xl font-semibold text-ink-900">Page not found</h1>
    <p className="mt-1 max-w-sm text-sm text-ink-400">The page you're looking for doesn't exist or may have moved.</p>
    <Link to="/">
      <Button className="mt-5">Back to dashboard</Button>
    </Link>
  </div>
);

export default NotFound;
