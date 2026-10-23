import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Download,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const HRTimesheets: React.FC = () => {
  const { timesheets, approveTimesheet } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [success, setSuccess] = useState(false);

  const pendingTimesheets = timesheets.filter(t => t.status === 'Submitted');
  const approvedTimesheets = timesheets.filter(t => t.status === 'Approved');

  const displayedList = activeTab === 'pending' ? pendingTimesheets : approvedTimesheets;

  const handleApprove = (id: string) => {
    approveTimesheet(id);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Timesheet Approvals' }]}
        title="Timesheet Approvals Queue"
        subtitle="Authorize billable hours submitted across client deliverables before payroll finalization"
        tabs={[
          { id: 'pending', label: 'Awaiting HR Sign-off', count: pendingTimesheets.length },
          { id: 'approved', label: 'Approved Timesheets', count: approvedTimesheets.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      {success && (
        <div className="p-3.5 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Timesheet approved and synchronized with client invoicing ledger!</span>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Timesheet Records ({displayedList.length})
          </h3>
          <span className="text-xs text-text-tertiary">Fortnightly cycles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Period</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Total Hours</th>
                <th className="px-4 py-3">Submission Timestamp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-secondary">
                    No timesheets in this view.
                  </td>
                </tr>
              ) : (
                displayedList.map(item => (
                  <tr key={item.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                    <td className="px-5 py-3 font-bold text-text font-mono">
                      {item.periodLabel}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-text">Vikram Rao</p>
                      <p className="text-[11px] text-text-tertiary">Senior Cloud Architect</p>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {item.totalHours} Hours
                    </td>

                    <td className="px-4 py-3 font-mono text-text-secondary">
                      {item.submittedAt || 'Draft'}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={item.status === 'Approved' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {item.status}
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {item.status === 'Submitted' ? (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="h-7 px-3 rounded bg-[#15803D] text-white font-semibold text-xs hover:bg-[#126b33]"
                        >
                          Approve Timesheet
                        </button>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">
                          Approved by {item.approvedBy}
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
    </div>
  );
};
