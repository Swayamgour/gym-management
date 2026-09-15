import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total } = meta;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
      <p className="text-xs text-ink-400">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={14} /> Prev
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
