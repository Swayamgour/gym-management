import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, UserPlus, MessageCircle, Pencil, CheckCircle2 } from 'lucide-react';
import { useGetLeadsQuery, useConvertLeadMutation } from '../api/leadApi';
import PageHeader from '../components/ui/PageHeader';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import LeadFormModal from '../components/leads/LeadFormModal';
import SendMessageModal from '../components/shared/SendMessageModal';
import { formatDate } from '../utils/format';
import { listContainer, listItemStatic } from '../components/ui/listStyles';

const TABS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'trial', label: 'Trial' },
  { value: 'converted', label: 'Converted' },
  { value: 'not-interested', label: 'Not interested' }
];

const statusTone = {
  new: 'brand',
  'follow-up': 'amber',
  trial: 'neutral',
  converted: 'mint',
  'not-interested': 'rose'
};

const Leads = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [messageLead, setMessageLead] = useState(null);
  const [convertLead] = useConvertLeadMutation();

  const { data, isLoading } = useGetLeadsQuery({ status: status || undefined, page, limit: 15 });
  const leads = data?.data?.leads || [];
  const meta = data?.meta;

  const handleConvert = async (lead) => {
    try {
      await convertLead(lead._id).unwrap();
      toast.success(`${lead.name} converted to a member`);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not convert lead');
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track enquiries from first contact through to a converted member."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> New enquiry
          </Button>
        }
      />

      <div className="mb-4">
        <Tabs tabs={TABS} active={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </div>

      {isLoading ? (
        <Loader />
      ) : leads.length === 0 ? (
        <EmptyState icon={UserPlus} title="No leads here" description="New enquiries you add will show up in this pipeline." actionLabel="New enquiry" onAction={() => setFormOpen(true)} />
      ) : (
        <div>
          <ul className={listContainer}>
            {leads.map((lead) => (
              <li key={lead._id} className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${listItemStatic}`}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={lead.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{lead.name}</p>
                    <p className="text-xs text-ink-400">
                      {lead.mobile} {lead.interestedPackage && `· ${lead.interestedPackage.name}`}
                      {lead.followUpDate && ` · Follow up ${formatDate(lead.followUpDate)}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone[lead.status]}>{lead.status}</Badge>
                  <Button variant="outline" size="sm" onClick={() => { setEditing(lead); setFormOpen(true); }}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="success" size="sm" onClick={() => setMessageLead(lead)}>
                    <MessageCircle size={14} />
                  </Button>
                  {lead.status !== 'converted' && (
                    <Button size="sm" onClick={() => handleConvert(lead)}>
                      <CheckCircle2 size={14} /> Convert
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}

      <LeadFormModal open={formOpen} onClose={() => setFormOpen(false)} lead={editing} />
      {messageLead && <SendMessageModal open={Boolean(messageLead)} onClose={() => setMessageLead(null)} leadId={messageLead._id} />}
    </div>
  );
};

export default Leads;
