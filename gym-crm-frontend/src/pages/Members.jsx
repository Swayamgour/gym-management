import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Phone, Users } from 'lucide-react';
import { useGetMembersQuery } from '../api/memberApi';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import MembershipStatusBadge from '../components/MembershipStatusBadge';
import MemberFormModal from '../components/members/MemberFormModal';
import { formatDate } from '../utils/format';
import { useAuth } from '../hooks/useAuth';
import { listContainer, listItem } from '../components/ui/listStyles';

const Members = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();
  const { canManage, isReceptionist } = useAuth();

  const { data, isLoading, isFetching } = useGetMembersQuery({
    search: search || undefined,
    membershipStatus: status || undefined,
    page,
    limit: 15
  });

  const members = data?.data?.members || [];
  const meta = data?.meta;

  return (
    <div>
      <PageHeader
        title="Members"
        description="Search, filter, and manage every member in your gym."
        actions={
          (canManage || isReceptionist) && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={16} /> Add member
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or mobile" />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="sm:w-52">
          <option value="">All membership statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="no_membership">No membership yet</option>
        </Select>
      </div>

      {isLoading ? (
        <Loader />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members found"
          description="Try a different search, or add your first member to get started."
          actionLabel={canManage || isReceptionist ? 'Add member' : undefined}
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div className={isFetching ? 'opacity-60' : ''}>
          <ul className={listContainer}>
            {members.map((m) => (
              <li
                key={m._id}
                onClick={() => navigate(`/members/${m._id}`)}
                className={`flex cursor-pointer flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${listItem}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={m.name} src={m.photo} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{m.name}</p>
                    <p className="text-xs text-ink-400">
                      {m.mobile} {m.trainer && `· Trainer: ${m.trainer.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="text-right">
                    {m.membership ? (
                      <>
                        <p className="text-xs text-ink-400">{m.membership.packageName} · till {formatDate(m.membership.expiryDate)}</p>
                        <MembershipStatusBadge status={m.membership.status} />
                      </>
                    ) : (
                      <MembershipStatusBadge status={null} />
                    )}
                  </div>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => window.open(`tel:${m.mobile}`)}>
                      <Phone size={15} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      <MemberFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default Members;
