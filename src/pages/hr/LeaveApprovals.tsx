import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
  Check,
  X,
  Clock,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const LeaveApprovals: React.FC = () => {
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'half' | 'all'>('pending');
  const [rejectModalReqId, setRejectModalReqId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending');
  const halfDayRequests = leaveRequests.filter(r => r.isHalfDay && r.status === 'Pending');

  const displayedList =
    activeTab === 'pending'
      ? pendingRequests
      : activeTab === 'half'
      ? halfDayRequests
      : leaveRequests;

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReqId) return;
    rejectLeaveRequest(rejectModalReqId, rejectNote);
    setRejectModalReqId(null);
    setRejectNote('');
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Leave Approvals' }]}
        title="Leave & Time-Off Approvals Queue"
        subtitle="Review employee casual, sick and half-day absence applications across business units"
        tabs={[
          { id: 'pending', label: 'Pending Approvals', count: pendingRequests.length },
          { id: 'half', label: 'Half-Day Requests', count: halfDayRequests.length },
          { id: 'all', label: 'All Requests History', count: leaveRequests.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      {/* Requests Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Queue · {displayedList.length} items
          </h3>
          <span className="text-xs text-text-tertiary">Direct supervisor & HR signoff</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Employee</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">
                    ✓ All caught up! No leave applications pending your approval.
                  </td>
                </tr>
              ) : (
                displayedList.map(req => (
                  <tr key={req.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center">
                          {req.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-text">{req.employeeName}</p>
                          <p className="text-[11px] text-text-tertiary">{req.department}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-text">
                      {req.type} {req.isHalfDay ? `(Half-Day)` : ''}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-text">{req.fromDate}</span>
                      {req.fromDate !== req.toDate && (
                        <span className="text-text-secondary"> to {req.toDate}</span>
                      )}
                      {req.halfDayPeriod && (
                        <span className="block text-[10px] text-primary">{req.halfDayPeriod}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-bold text-text">{req.days}</td>

                    <td className="px-4 py-3 max-w-xs truncate text-text-secondary">
                      {req.reason}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          req.status === 'Approved'
                            ? 'success'
                            : req.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {req.status}
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveLeaveRequest(req.id, 'Approved by People Ops')}
                            className="h-7 px-3 rounded bg-[#15803D] hover:bg-[#126b33] text-white text-xs font-semibold shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModalReqId(req.id)}
                            className="h-7 px-3 rounded border border-[#C81E3A] text-[#C81E3A] hover:bg-[#FDECEF] text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">
                          Actioned by {req.actionedBy}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectModalReqId}
        onClose={() => setRejectModalReqId(null)}
        title="Reject Leave Application"
        subtitle="Provide an HR explanation for rejection to share with the employee"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div>
            <label className="block micro-label text-text-secondary mb-1">
              Rejection Reason & HR Policy Note
            </label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Inadequate leave balance accrued, or critical client delivery milestone during requested dates..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalReqId(null)}
              className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-btn bg-[#C81E3A] text-white text-xs font-semibold shadow-sm hover:bg-[#a5172f]"
            >
              Confirm Rejection →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
