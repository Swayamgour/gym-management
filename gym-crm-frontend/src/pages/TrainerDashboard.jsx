import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CalendarClock, Activity } from 'lucide-react';
import { useGetTrainerDashboardQuery } from '../api/trainerApi';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { ChevronRight } from 'lucide-react';
import { listContainer, listItem } from '../components/ui/listStyles';

const TrainerDashboard = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetTrainerDashboardQuery(trainerId);

  if (isLoading) return <Loader fullHeight />;
  const stats = data?.data || {};

  return (
    <div>
      {trainerId && (
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft size={16} /> Back
        </button>
      )}
      <PageHeader title={trainerId ? 'Trainer overview' : 'My dashboard'} description="Members assigned to this trainer and today's activity." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="My members" value={stats.myMembersCount ?? 0} icon={Users} accent="brand" />
        <StatCard label="Today's members" value={stats.todaysMembersCount ?? 0} icon={CalendarClock} accent="mint" />
        <StatCard label="Today's sessions" value={stats.todaysSessions ?? 0} icon={Activity} accent="amber" />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-ink-700">My members</p>
        {!stats.myMembers?.length ? (
          <EmptyState title="No members assigned yet" description="The owner or manager can assign members to you from the Members page." />
        ) : (
          <ul className={listContainer}>
            {stats.myMembers.map((m) => (
              <li
                key={m._id}
                onClick={() => navigate(`/members/${m._id}`)}
                className={`flex cursor-pointer items-center justify-between ${listItem}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={m.name} src={m.photo} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{m.name}</p>
                    <p className="text-xs text-ink-400">{m.mobile}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-300" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;
