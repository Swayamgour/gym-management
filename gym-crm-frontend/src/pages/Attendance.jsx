import { useState } from 'react';
import toast from 'react-hot-toast';
import { LogIn, LogOut, DoorOpen, CalendarClock } from 'lucide-react';
import { useGetMembersQuery } from '../api/memberApi';
import { useCheckInMutation, useCheckOutMutation, useGetCurrentlyInsideQuery, useGetTodayAttendanceQuery } from '../api/attendanceApi';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { formatDate } from '../utils/format';
import { listContainer, listItemStatic } from '../components/ui/listStyles';

const TABS = [
  { value: 'inside', label: 'Currently inside' },
  { value: 'today', label: "Today's attendance" }
];

const Attendance = () => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('inside');
  const { data: searchRes } = useGetMembersQuery({ search, limit: 6 }, { skip: search.length < 2 });
  const { data: insideRes, isLoading: insideLoading } = useGetCurrentlyInsideQuery();
  const { data: todayRes, isLoading: todayLoading } = useGetTodayAttendanceQuery();
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [checkOut] = useCheckOutMutation();

  const results = searchRes?.data?.members || [];
  const inside = insideRes?.data?.records || [];
  const today = todayRes?.data?.records || [];

  const handleCheckIn = async (memberId) => {
    try {
      await checkIn({ memberId }).unwrap();
      toast.success('Checked in');
      setSearch('');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not check in');
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      await checkOut({ memberId }).unwrap();
      toast.success('Checked out');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not check out');
    }
  };

  return (
    <div>
      <PageHeader title="Attendance" description="Check members in and out, and see who's on the floor right now." />

      <div className="mb-6 rounded-xl2 bg-white p-4 shadow-soft sm:p-5">
        <p className="mb-3 text-sm font-medium text-ink-700">Check in a member</p>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or mobile to check in" />
        {search.length >= 2 && (
          <ul className="mt-3 divide-y divide-ink-100 rounded-lg border border-ink-100">
            {results.length === 0 ? (
              <li className="p-3 text-sm text-ink-400">No members found</li>
            ) : (
              results.map((m) => (
                <li key={m._id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.name} size={30} />
                    <div>
                      <p className="text-sm font-medium text-ink-900">{m.name}</p>
                      <p className="text-xs text-ink-400">{m.mobile}</p>
                    </div>
                  </div>
                  <Button size="sm" loading={checkingIn} onClick={() => handleCheckIn(m._id)}>
                    <LogIn size={14} /> Check in
                  </Button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'inside' &&
        (insideLoading ? (
          <Loader />
        ) : inside.length === 0 ? (
          <EmptyState icon={DoorOpen} title="Nobody's checked in right now" description="Members you check in will show up here until they check out." />
        ) : (
          <div>
            <ul className={listContainer}>
              {inside.map((r) => (
                <li key={r._id} className={`flex items-center justify-between ${listItemStatic}`}>
                  <div className="flex items-center gap-3">
                    <Avatar name={r.member?.name} src={r.member?.photo} />
                    <div>
                      <p className="text-sm font-medium text-ink-900">{r.member?.name}</p>
                      <p className="text-xs text-ink-400">Since {formatDate(r.checkIn, 'h:mm a')}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleCheckOut(r.member?._id)}>
                    <LogOut size={14} /> Check out
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ))}

      {tab === 'today' &&
        (todayLoading ? (
          <Loader />
        ) : today.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No visits yet today" />
        ) : (
          <div>
            <ul className={listContainer}>
              {today.map((r) => (
                <li key={r._id} className={`flex items-center justify-between ${listItemStatic}`}>
                  <div className="flex items-center gap-3">
                    <Avatar name={r.member?.name} src={r.member?.photo} />
                    <p className="text-sm font-medium text-ink-900">{r.member?.name}</p>
                  </div>
                  <p className="text-xs text-ink-400">
                    {formatDate(r.checkIn, 'h:mm a')} — {r.checkOut ? formatDate(r.checkOut, 'h:mm a') : 'Still inside'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default Attendance;
