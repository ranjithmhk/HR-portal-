import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { MasterDetail } from '../../components/ui/MasterDetail';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Drawer } from '../../components/ui/Drawer';
import { FileDropzone } from '../../components/ui/FileDropzone';
import { SupportRequest } from '../../types';

export const MyRequests: React.FC = () => {
  const {
    supportRequests,
    submitSupportRequest,
    addRequestReply,
    currentUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('REQ-1049');
  const [replyText, setReplyText] = useState('');
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);

  // New Request Form
  const [category, setCategory] = useState<SupportRequest['category']>('Visa & Immigration');
  const [subCategory, setSubCategory] = useState('H-1B Stamping Documents');
  const [priority, setPriority] = useState<SupportRequest['priority']>('Medium — 3 days SLA');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [newSuccess, setNewSuccess] = useState(false);

  const userRequests = supportRequests.filter(r => r.employeeId === currentUser.id);

  const filteredRequests = userRequests.filter(r => {
    if (activeTab === 'closed') return r.status === 'Resolved';
    return r.status !== 'Resolved';
  });

  const selectedRequest = supportRequests.find(r => r.id === selectedRequestId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedRequestId) return;

    addRequestReply(selectedRequestId, replyText);
    setReplyText('');
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    submitSupportRequest({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      category,
      subCategory,
      priority,
      subject,
      description,
    });

    setNewSuccess(true);
    setSubject('');
    setDescription('');
    setTimeout(() => {
      setNewSuccess(false);
      setIsNewDrawerOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'My Requests' }]}
        title="HR Help Desk & Requests"
        subtitle="Submit immigration questions, payroll adjustments, and insurance benefits requests with SLA tracking"
        actions={
          <button
            onClick={() => setIsNewDrawerOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Submit New Request</span>
          </button>
        }
        tabs={[
          {
            id: 'active',
            label: 'Active Requests',
            count: userRequests.filter(r => r.status !== 'Resolved').length,
          },
          {
            id: 'closed',
            label: 'Closed Tickets',
            count: userRequests.filter(r => r.status === 'Resolved').length,
          },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      {/* Master–Detail Layout */}
      <MasterDetail
        hasSelection={!!selectedRequest}
        onClearSelection={() => setSelectedRequestId(null)}
        title={selectedRequest ? `Ticket Thread · ${selectedRequest.id}` : 'Select a ticket'}
        master={
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-secondary">
                No tickets in this view.
              </div>
            ) : (
              filteredRequests.map(req => {
                const isSelected = selectedRequestId === req.id;

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-4 cursor-pointer transition-colors space-y-2.5 ${
                      isSelected
                        ? 'bg-primary-50/50'
                        : 'hover:bg-surface-muted/60'
                    }`}
                  >
                    {/* Header Chips */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-text">{req.id}</span>
                        <StatusBadge
                          variant={
                            req.status === 'Resolved'
                              ? 'success'
                              : req.status === 'Awaiting Your Reply'
                              ? 'warning'
                              : 'info'
                          }
                          size="sm"
                        >
                          {req.status}
                        </StatusBadge>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-muted text-text-secondary">
                          {req.category}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono font-medium text-text-tertiary">
                        {req.createdDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-text line-clamp-1">{req.subject}</h4>

                    <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold font-mono">
                          {req.jiraTicket ? `Jira: ${req.jiraTicket}` : 'Internal Ticket'}
                        </span>
                        <span>· Handler: {req.handler.split(' ')[0]}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#B45309]">
                        {req.slaRemaining}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        }
        detail={
          selectedRequest ? (
            <div className="space-y-5">
              {/* Request Metadata Banner */}
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Subject:</span>
                  <span className="font-bold text-text truncate max-w-xs">{selectedRequest.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Assigned Handler:</span>
                  <span className="font-semibold text-primary">{selectedRequest.handler}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">SLA Status:</span>
                  <span className="font-mono font-bold text-[#B45309]">
                    {selectedRequest.slaRemaining}
                  </span>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {selectedRequest.replies.map(msg => {
                  const isUser = msg.sender === currentUser.name;

                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                        isUser
                          ? 'bg-primary-50 border border-primary-100 ml-4'
                          : 'bg-surface-muted border border-border mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text">
                          {msg.sender} ({msg.role})
                        </span>
                        <span className="text-[10px] text-text-tertiary">{msg.timestamp}</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed">{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {selectedRequest.status !== 'Resolved' && (
                <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-border">
                  <textarea
                    rows={3}
                    required
                    placeholder="Type a response to HR..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-text-tertiary"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="p-1.5 text-text-tertiary hover:text-text rounded hover:bg-surface-muted"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="h-8 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm disabled:opacity-40"
                    >
                      Send Reply →
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null
        }
      />

      {/* Submit New Request Drawer */}
      <Drawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        title="Submit Support Request"
        subtitle="Open a trackable ticket with HR & Operations team"
      >
        {newSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Ticket Created</h4>
            <p className="text-xs text-text-secondary">
              Your request has been routed to Aisha Khan (HR Specialist) with 3 days SLA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Visa & Immigration">Visa & Immigration</option>
                <option value="Payroll & Tax">Payroll & Tax</option>
                <option value="Benefits & Insurance">Benefits & Insurance</option>
                <option value="IT & Equipment">IT & Equipment</option>
                <option value="Workplace">Workplace & Ergonomics</option>
              </select>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Sub-Category</label>
              <input
                type="text"
                placeholder="e.g. H-1B Travel Document Request"
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Priority & SLA Tier</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Medium — 3 days SLA">Medium — 3 days SLA</option>
                <option value="Low — 5 days SLA">Low — 5 days SLA</option>
                <option value="High — 24h SLA">High — 24h SLA</option>
                <option value="Urgent — 4h SLA">Urgent — 4h SLA</option>
              </select>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of your inquiry..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Detailed Description</label>
              <textarea
                rows={4}
                required
                placeholder="Provide dates, consular interview slots, or specific documentation required..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewDrawerOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
              >
                Create Support Ticket →
              </button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
};
