import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useGetMembershipsQuery } from '../api/membershipApi';
import PageHeader from '../components/ui/PageHeader';
import Tabs from '../components/ui/Tabs';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import BucketBadge from '../components/BucketBadge';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate } from '../utils/format';
import { listContainer, listItemStatic } from '../components/ui/listStyles';

const TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' }
];

const Memberships = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useGetMembershipsQuery({ status: status || undefined, page, limit: 15 });
  const memberships = data?.data?.memberships || [];
  const meta = data?.meta;

  return (
    <div>
      <PageHeader title="Memberships" description="Every package assigned, with live expiry status." />

      <div className="mb-4">
        <Tabs tabs={TABS} active={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </div>

      {isLoading ? (
        <Loader />
      ) : memberships.length === 0 ? (
        <EmptyState icon={CreditCard} title="No memberships found" description="Assign a package to a member to see it here." />
      ) : (
        <div>
          <ul className={listContainer}>
            {memberships.map((m) => (
              <li key={m._id} className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${listItemStatic}`}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={m.member?.name} src={m.member?.photo} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{m.member?.name}</p>
                    <p className="text-xs text-ink-400">
                      {m.packageName} · {formatDate(m.startDate)} → {formatDate(m.expiryDate)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="text-right text-sm">
                    <p className="text-ink-800">{formatCurrency(m.paidAmount)} / {formatCurrency(m.amount)}</p>
                    {m.pendingAmount > 0 && <p className="text-xs text-rose-600">Pending {formatCurrency(m.pendingAmount)}</p>}
                  </div>
                  <BucketBadge bucket={m.expiryBucket} />
                  <Button variant="outline" size="sm" onClick={() => navigate(`/members/${m.member?._id}`)}>
                    View member
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Memberships;
