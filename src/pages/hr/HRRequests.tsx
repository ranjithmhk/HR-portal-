import React, { useState } from 'react';
import {
  LifeBuoy,
  Clock,
  Send,
  User,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { MasterDetail } from '../../components/ui/MasterDetail';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SupportRequest } from '../../types';

export const HRRequests: React.FC = () => {
  const { supportRequests, addRequestReply, updateRequestStatus } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('REQ-1055');
  const [replyText, setReplyText] = useState('');

  const pendingRequests = supportRequests.filter(r => r.status !== 'Resolved');
  const displayedRequests = activeTab === 'pending' ? pendingRequests : supportRequests;

  const selectedRequest = supportRequests.find(r => r.id === selectedRequestId) || supportRequests[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedRequest) return;

    addRequestReply(selectedRequest.id, replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Requests & Help Desk' }]}
        title="Employee Requests & Help Desk Queue"
        subtitle="Manage incoming immigration tickets, tax adjustments, and SLA resolutions"
        tabs={[
          { id: 'pending', label: 'Action Required', count: pendingRequests.length },
          { id: 'all', label: 'All Tickets', count: supportRequests.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      <MasterDetail
        hasSelection={!!selectedRequest}
        onClearSelection={() => setSelectedRequestId(null)}
        title={selectedRequest ? `Ticket ${selectedRequest.id} · ${selectedRequest.category}` : 'Select Ticket'}
        master={
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
            {displayedRequests.map(req => {
              const isSelected = selectedRequestId === req.id;

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-4 cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-primary-50/50' : 'hover:bg-surface-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text">{req.id}</span>
                      <span className="font-semibold text-xs text-text">{req.employeeName}</span>
                    </div>
                    <StatusBadge
                      variant={
                        req.status === 'Resolved'
                          ? 'success'
                          : req.status === 'Pending HR'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {req.status}
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-text font-medium line-clamp-1">{req.subject}</p>

                  <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                    <span className="text-primary font-mono">{req.jiraTicket || 'Internal'}</span>
                    <span className="text-[#B45309] font-semibold">{req.slaRemaining}</span>
                  </div>
                </div>
              );
            })}
          </div>
        }
        detail={
          selectedRequest ? (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Employee:</span>
                  <strong className="text-text">{selectedRequest.employeeName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Category:</span>
                  <span className="font-medium text-text">{selectedRequest.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">SLA Time Left:</span>
                  <span className="font-mono font-bold text-[#B45309]">{selectedRequest.slaRemaining}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border">
                  <span className="text-text-secondary">Status:</span>
                  <select
                    value={selectedRequest.status}
                    onChange={e => updateRequestStatus(selectedRequest.id, e.target.value as any)}
                    className="h-7 px-2 text-xs rounded border border-border bg-surface text-text font-semibold"
                  >
                    <option value="Pending HR">Pending HR</option>
                    <option value="Awaiting Your Reply">Awaiting Employee Reply</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved / Closed</option>
                  </select>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {selectedRequest.replies.map(r => (
                  <div key={r.id} className="p-3 rounded-lg bg-surface-muted text-xs space-y-1">
                    <div className="flex justify-between font-bold text-text">
                      <span>{r.sender} ({r.role})</span>
                      <span className="text-[10px] text-text-tertiary">{r.timestamp}</span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{r.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-border">
                <textarea
                  rows={3}
                  required
                  placeholder="Compose official HR reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                  >
                    Send Reply & Update Status →
                  </button>
                </div>
              </form>
            </div>
          ) : null
        }
      />
    </div>
  );
};
