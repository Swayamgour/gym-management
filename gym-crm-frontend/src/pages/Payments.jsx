import { useState } from 'react';
import toast from 'react-hot-toast';
import { Wallet, MessageCircle, Eye } from 'lucide-react';
import { useGetPaymentsQuery, useGetPendingPaymentsQuery } from '../api/paymentApi';
import PageHeader from '../components/ui/PageHeader';
import Tabs from '../components/ui/Tabs';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';
import { formatCurrency, formatDateTime } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { listContainer, listItemStatic } from '../components/ui/listStyles';

const TABS = [
  { value: 'history', label: 'Payment history' },
  { value: 'pending', label: 'Pending balances' }
];

const Payments = () => {
  const [tab, setTab] = useState('history');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { send } = useWhatsApp();

  const { data: historyRes, isLoading: historyLoading } = useGetPaymentsQuery({ page, limit: 15 }, { skip: tab !== 'history' });
  const { data: pendingRes, isLoading: pendingLoading } = useGetPendingPaymentsQuery(undefined, { skip: tab !== 'pending' });

  const payments = historyRes?.data?.payments || [];
  const meta = historyRes?.meta;
  const pending = pendingRes?.data?.pending || [];

  return (
    <div>
      <PageHeader title="Payments" description="Track what's been collected and who still owes a balance." />

      <div className="mb-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'history' &&
        (historyLoading ? (
          <Loader />
        ) : payments.length === 0 ? (
          <EmptyState icon={Wallet} title="No payments recorded yet" description="Payments recorded against a membership will show up here." />
        ) : (
          <div>
            <ul className={listContainer}>
              {payments.map((p) => (
                <li key={p._id} className={`flex items-center justify-between ${listItemStatic}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={p.member?.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{p.member?.name}</p>
                      <p className="text-xs text-ink-400 capitalize">{p.method} · {formatDateTime(p.paymentDate)}</p>
                    </div>
                  </div>
                  <p className="font-display font-semibold text-ink-900">{formatCurrency(p.amount)}</p>
                </li>
              ))}
            </ul>
            <div className="px-4">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </div>
        ))}

      {tab === 'pending' &&
        (pendingLoading ? (
          <Loader />
        ) : pending.length === 0 ? (
          <EmptyState icon={Wallet} title="No pending balances" description="Every membership is fully paid up. Nice work!" />
        ) : (
          <div>
            <ul className={listContainer}>
              {pending.map((p) => (
                <li key={p.membershipId} className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${listItemStatic}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={p.member?.name} src={p.member?.photo} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{p.member?.name}</p>
                      <p className="text-xs text-ink-400">{p.packageName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <p className="font-display font-semibold text-rose-600">{formatCurrency(p.pendingAmount)}</p>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => send({ memberId: p.member?._id, messageType: 'payment_pending' })}
                    >
                      <MessageCircle size={14} /> <span className="hidden sm:inline">Remind</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/members/${p.member?._id}?tab=membership`)}>
                      <span className="sm:hidden">
                        <Eye size={14} />
                      </span>
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default Payments;
