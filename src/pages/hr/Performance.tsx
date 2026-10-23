import React, { useState } from 'react';
import {
  Award,
  Star,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { StarRating } from '../../components/ui/StarRating';

export const Performance: React.FC = () => {
  const { reviewCycles, users } = useStore();

  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false);
  const [cycleTitle, setCycleTitle] = useState('quarterly · Q2 2026');
  const [cyclePeriod, setCyclePeriod] = useState('Apr 1 – Jun 30, 2026');
  const [cycleDueDate, setCycleDueDate] = useState('2026-07-31');
  const [success, setSuccess] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsCreateCycleOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Performance Cycles' }]}
        title="Performance Management & Review Cycles"
        subtitle="Manage quarterly 360 appraisal cycles, rating distributions, and managerial audits"
        actions={
          <button
            onClick={() => setIsCreateCycleOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Create Review Cycle</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Metrics Card */}
        <Card className="p-5 space-y-3">
          <span className="micro-label text-text-secondary">Average Appraisal Rating</span>
          <div className="flex items-baseline gap-2">
            <span className="text-kpi text-text">4.8</span>
            <span className="text-xs text-text-tertiary">/ 5.0 stars</span>
          </div>
          <StarRating value={5} readOnly size="sm" />
          <p className="text-[11px] text-text-secondary pt-2 border-t border-border">
            Based on Q4 2025 closed appraisals across all delivery teams
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <span className="micro-label text-text-secondary">Submission Compliance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-kpi text-[#15803D]">92%</span>
            <span className="text-xs text-[#15803D] font-bold">On-time</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
            <div className="h-full bg-[#15803D] rounded-full" style={{ width: '92%' }} />
          </div>
          <p className="text-[11px] text-text-secondary pt-2 border-t border-border">
            18 of 20 evaluations submitted before cycle deadline
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <span className="micro-label text-text-secondary">Next Appraisal Window</span>
          <div className="flex items-baseline gap-2">
            <span className="text-kpi text-primary">Q1 2026</span>
          </div>
          <p className="text-xs text-text-secondary">Closes in 9 days (Oct 31, 2026)</p>
          <p className="text-[11px] text-text-tertiary pt-2 border-t border-border">
            Executive review session scheduled for Nov 5
          </p>
        </Card>
      </div>

      {/* Review Cycles Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">Review Cycles History</h3>
          <span className="text-xs text-text-tertiary">Quarterly governance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Cycle Title</th>
                <th className="px-4 py-3">Evaluation Scope</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviewCycles.map(c => (
                <tr key={c.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                  <td className="px-5 py-3 font-bold text-text capitalize">{c.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.period}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{c.dueDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={c.status === 'Closed' ? 'success' : 'warning'} size="sm">
                      {c.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => alert(`Exporting review calibration data for ${c.title}`)}
                      className="text-primary font-semibold hover:underline"
                    >
                      Calibration Report →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Review Cycle Modal */}
      <Modal
        isOpen={isCreateCycleOpen}
        onClose={() => setIsCreateCycleOpen(false)}
        title="Create New Review Cycle"
        subtitle="Initiate a company-wide appraisal cycle for engineers and managers"
      >
        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" />
            <h4 className="font-heading font-bold text-sm text-text">Review Cycle Launched</h4>
            <p className="text-xs text-text-secondary">
              Notifications dispatched to all active employees and managers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Cycle Title</label>
              <input
                type="text"
                required
                value={cycleTitle}
                onChange={e => setCycleTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Period Scope</label>
              <input
                type="text"
                required
                value={cyclePeriod}
                onChange={e => setCyclePeriod(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Appraisal Due Date</label>
              <input
                type="date"
                required
                value={cycleDueDate}
                onChange={e => setCycleDueDate(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateCycleOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
              >
                Launch Cycle →
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
