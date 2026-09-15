import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Pencil,
  UserCog,
  RefreshCw,
  Wallet,
  CalendarClock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useGetMemberByIdQuery } from '../api/memberApi';
import Loader from '../components/ui/Loader';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import MembershipStatusBadge from '../components/MembershipStatusBadge';
import BucketBadge from '../components/BucketBadge';
import { formatCurrency, formatDate, formatDateTime, formatRelative } from '../utils/format';
import { useAuth } from '../hooks/useAuth';

import MemberFormModal from '../components/members/MemberFormModal';
import AssignTrainerModal from '../components/members/AssignTrainerModal';
import RenewMembershipModal from '../components/members/RenewMembershipModal';
import RecordPaymentModal from '../components/members/RecordPaymentModal';
import SendMessageModal from '../components/shared/SendMessageModal';
import { listContainer, listItemStatic } from '../components/ui/listStyles';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'membership', label: 'Membership' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'payments', label: 'Payments' },
  { value: 'activity', label: 'Activity' }
];

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canManage, isReceptionist } = useAuth();
  const { data, isLoading } = useGetMemberByIdQuery(id);

  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');
  const [editOpen, setEditOpen] = useState(false);
  const [trainerOpen, setTrainerOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  if (isLoading) return <Loader fullHeight />;

  const payload = data?.data;
  if (!payload) return null;

  const { overview, membership, attendance, payments, trainer, activity } = payload;
  const member = overview.member;
  const currentMembership = overview.currentMembership;
  const canEdit = canManage || isReceptionist;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6 rounded-xl2 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={member.name} src={member.photo} size={56} />
            <div>
              <h1 className="font-display text-xl font-semibold text-ink-900">{member.name}</h1>
              <p className="text-sm text-ink-400">{member.mobile} {member.email && `· ${member.email}`}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <MembershipStatusBadge status={currentMembership?.status} />
                {currentMembership && <BucketBadge bucket={currentMembership.expiryBucket} />}
                {!member.isActive && <Badge tone="rose">Deactivated</Badge>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open(`tel:${member.mobile}`)}>
              <Phone size={14} /> <span className="hidden sm:inline">Call</span>
            </Button>
            <Button variant="success" size="sm" onClick={() => setMessageOpen(true)}>
              <MessageCircle size={14} /> <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => setTrainerOpen(true)}>
                <UserCog size={14} /> <span className="hidden sm:inline">Trainer</span>
              </Button>
            )}
            {canEdit && (
              <Button size="sm" onClick={() => setRenewOpen(true)}>
                <RefreshCw size={14} /> {currentMembership ? 'Renew' : 'Assign package'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="rounded-2xl bg-white p-3.5 shadow-soft sm:p-5">
            <p className="text-[11px] text-ink-400 sm:text-xs">Joined</p>
            <p className="mt-1 font-display text-sm font-semibold text-ink-900 sm:text-lg">{formatDate(member.joiningDate)}</p>
          </div>
          <div className="rounded-2xl bg-white p-3.5 shadow-soft sm:p-5">
            <p className="text-[11px] text-ink-400 sm:text-xs">Total visits</p>
            <p className="mt-1 font-display text-sm font-semibold text-ink-900 sm:text-lg">{overview.totalVisits}</p>
          </div>
          <div className="rounded-2xl bg-white p-3.5 shadow-soft sm:p-5">
            <p className="text-[11px] text-ink-400 sm:text-xs">Last visit</p>
            <p className="mt-1 font-display text-sm font-semibold text-ink-900 sm:text-lg">
              {overview.lastVisit ? formatRelative(overview.lastVisit.checkIn) : 'Never'}
            </p>
          </div>
          <div className="col-span-3 rounded-2xl bg-white p-4 shadow-soft sm:p-5">
            <p className="mb-3 text-sm font-medium text-ink-700">Trainer</p>
            {trainer ? (
              <div className="flex items-center gap-3">
                <Avatar name={trainer.name} />
                <div>
                  <p className="text-sm font-medium text-ink-900">{trainer.name}</p>
                  <p className="text-xs text-ink-400">{trainer.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-400">No trainer assigned — the owner manages this member directly.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'membership' && (
        <div className="space-y-4">
          {currentMembership && (
            <div className="rounded-xl2 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-700">Current package</p>
                <MembershipStatusBadge status={currentMembership.status} />
              </div>
              <p className="mt-2 font-display text-lg font-semibold text-ink-900">{currentMembership.packageName}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-ink-400">Start</p>
                  <p className="text-ink-800">{formatDate(currentMembership.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Expiry</p>
                  <p className="text-ink-800">{formatDate(currentMembership.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Amount</p>
                  <p className="text-ink-800">{formatCurrency(currentMembership.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Pending</p>
                  <p className={currentMembership.pendingAmount > 0 ? 'font-medium text-rose-600' : 'text-mint-600'}>
                    {formatCurrency(currentMembership.pendingAmount)}
                  </p>
                </div>
              </div>
              {canEdit && currentMembership.pendingAmount > 0 && (
                <Button size="sm" className="mt-4" onClick={() => setPaymentOpen(true)}>
                  <Wallet size={14} /> Record payment
                </Button>
              )}
            </div>
          )}

          <div>
            <p className="mb-3 text-sm font-medium text-ink-700">Membership history</p>
            {membership.history.length === 0 ? (
              <p className="text-sm text-ink-400">No membership history yet.</p>
            ) : (
              <ul className={listContainer}>
                {membership.history.map((m) => (
                  <li key={m._id} className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between ${listItemStatic}`}>
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {m.packageName} {m.isRenewal && <span className="text-xs text-ink-400">(renewal)</span>}
                      </p>
                      <p className="text-xs text-ink-400">
                        {formatDate(m.startDate)} → {formatDate(m.expiryDate)}
                      </p>
                    </div>
                    <div className="text-sm text-ink-600">
                      {formatCurrency(m.paidAmount)} / {formatCurrency(m.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div>
          {attendance.length === 0 ? (
            <p className="text-sm text-ink-400">No attendance records yet.</p>
          ) : (
            <ul className={listContainer}>
              {attendance.map((a) => (
                <li key={a._id} className={`flex items-center justify-between ${listItemStatic}`}>
                  <div className="flex items-center gap-2">
                    <CalendarClock size={16} className="text-ink-300" />
                    <div>
                      <p className="text-sm text-ink-900">{formatDate(a.checkIn, 'd MMM yyyy')}</p>
                      <p className="text-xs text-ink-400">
                        {formatDate(a.checkIn, 'h:mm a')} — {a.checkOut ? formatDate(a.checkOut, 'h:mm a') : 'Still inside'}
                      </p>
                    </div>
                  </div>
                  {a.durationMinutes && <span className="text-xs text-ink-400">{a.durationMinutes} min</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div>
          {payments.length === 0 ? (
            <p className="text-sm text-ink-400">No payments recorded yet.</p>
          ) : (
            <ul className={listContainer}>
              {payments.map((p) => (
                <li key={p._id} className={`flex items-center justify-between ${listItemStatic}`}>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-ink-400 capitalize">{p.method} · {formatDate(p.paymentDate)}</p>
                  </div>
                  {p.note && <p className="text-xs text-ink-400">{p.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div>
          {activity.length === 0 ? (
            <p className="text-sm text-ink-400">No activity yet.</p>
          ) : (
            <ul className={listContainer}>
              {activity.map((ev, idx) => (
                <li key={idx} className={`flex items-center gap-3 ${listItemStatic}`}>
                  {ev.type === 'check_out' || ev.type === 'membership_renewed' ? (
                    <CheckCircle2 size={16} className="text-mint-600" />
                  ) : ev.type === 'check_in' ? (
                    <CheckCircle2 size={16} className="text-brand" />
                  ) : (
                    <XCircle size={16} className="text-ink-300" />
                  )}
                  <div>
                    <p className="text-sm text-ink-900">{ev.description}</p>
                    <p className="text-xs text-ink-400">{formatDateTime(ev.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <MemberFormModal open={editOpen} onClose={() => setEditOpen(false)} member={member} />
      <AssignTrainerModal open={trainerOpen} onClose={() => setTrainerOpen(false)} member={member} />
      <RenewMembershipModal open={renewOpen} onClose={() => setRenewOpen(false)} member={member} />
      {currentMembership && (
        <RecordPaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} member={member} membership={currentMembership} />
      )}
      <SendMessageModal open={messageOpen} onClose={() => setMessageOpen(false)} memberId={member._id} />
    </div>
  );
};

export default MemberDetail;
