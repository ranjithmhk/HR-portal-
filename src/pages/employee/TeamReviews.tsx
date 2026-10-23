import React, { useState } from 'react';
import {
  Users,
  Star,
  CheckCircle2,
  Send,
  AlertCircle,
  Award,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StarRating } from '../../components/ui/StarRating';
import { User } from '../../types';

export const TeamReviews: React.FC = () => {
  const { users, currentUser } = useStore();

  // Find direct reports (e.g. Priya Patel reports to Vikram Rao)
  const directReports = users.filter(u => u.manager === currentUser.name || u.manager === 'Vikram Rao');

  const [selectedReport, setSelectedReport] = useState<User>(directReports[0] || users[3]);
  const [managerRating, setManagerRating] = useState<number>(5);
  const [managerNotes, setManagerNotes] = useState(
    'Demonstrated stellar execution on the real-time model deployment for our FinTech client. Proactively identified query latency bottlenecks and mentored junior engineers on test coverage.'
  );
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Team Reviews' }]}
        title="Manager Appraisals · Direct Reports"
        subtitle="Evaluate and submit managerial ratings for team members reporting to you"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5/12): Direct Reports List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="micro-label text-text-secondary">Direct Reports ({directReports.length || 1})</span>
            <span className="text-xs text-text-tertiary">Q1 2026 Cycle</span>
          </div>

          <div className="space-y-2.5">
            {(directReports.length > 0 ? directReports : [users[3]]).map(report => {
              const isSelected = selectedReport?.id === report.id;

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-50/30 border-primary ring-2 ring-primary/20 shadow-sm'
                      : 'bg-surface border-border hover:bg-surface-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center">
                        {report.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-text">{report.name}</h4>
                        <p className="text-xs text-text-secondary">{report.jobTitle}</p>
                      </div>
                    </div>

                    <StatusBadge variant="info" size="sm">
                      {isSelected ? 'Editing Review' : 'Ready for Appraisal'}
                    </StatusBadge>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-text-tertiary">
                    <span>ID: #{report.id}</span>
                    <span>{report.workLocation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7/12): Rating & Comment Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="micro-label text-text-secondary">Appraisal Form</span>
                <h3 className="font-heading font-bold text-base text-text mt-0.5">
                  Appraisal for {selectedReport.name}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-muted text-text-secondary">
                {selectedReport.department}
              </span>
            </div>

            {success && (
              <div className="p-3.5 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>Managerial appraisal submitted for {selectedReport.name}!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block micro-label text-text-secondary mb-1">
                  Performance Rating (1 to 5 Stars)
                </label>
                <StarRating value={managerRating} onChange={setManagerRating} size="lg" />
              </div>

              <div>
                <label className="block micro-label text-text-secondary mb-1">
                  Managerial Assessment & Growth Goals
                </label>
                <textarea
                  rows={6}
                  required
                  value={managerNotes}
                  onChange={e => setManagerNotes(e.target.value)}
                  placeholder="Detail technical competence, communication, peer collaboration, and specific milestones for next quarter..."
                  className="w-full p-3.5 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs text-text-secondary space-y-1">
                <p className="font-semibold text-text">Review Process Note:</p>
                <p>
                  Upon submission, this appraisal is recorded into HR Console performance archives and visible during statutory compensation reviews.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="h-10 px-6 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
                >
                  Submit Manager Review →
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
