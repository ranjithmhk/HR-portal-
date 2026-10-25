import React, { useState } from 'react';
import {
  Award,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StarRating } from '../../components/ui/StarRating';
import { Modal } from '../../components/ui/Modal';

export const Reviews: React.FC = () => {
  const { reviewCycles, submitSelfReview, currentUser } = useStore();

  const [activeCycleModal, setActiveCycleModal] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [assessment, setAssessment] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedCycle = reviewCycles.find(c => c.id === activeCycleModal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle || assessment.length < 10) return;

    submitSelfReview(selectedCycle.id, rating, assessment);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setActiveCycleModal(null);
      setAssessment('');
    }, 2000);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Performance Reviews' }]}
        title="Quarterly Performance Reviews"
        subtitle="Submit self-evaluations, track managerial appraisals and view historic ratings"
      />

      <div className="space-y-4">
        {reviewCycles.map(cycle => {
          const isActionReq = cycle.status === 'Action Required';

          return (
            <Card key={cycle.id} className="p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-base text-text capitalize">
                      {cycle.title}
                    </h3>
                    <StatusBadge
                      variant={isActionReq ? 'warning' : 'success'}
                      size="sm"
                    >
                      {cycle.status}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Evaluation Period: {cycle.period} · Due by {cycle.dueDate}
                  </p>
                </div>

                {isActionReq ? (
                  <button
                    onClick={() => setActiveCycleModal(cycle.id)}
                    className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
                  >
                    Submit Self-Review →
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 className="w-4 h-4" /> Self-Appraisal Completed
                  </div>
                )}
              </div>

              {/* Assessment Breakdown */}
              {cycle.selfRating !== undefined && cycle.selfRating > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Self Assessment Card */}
                  <div className="p-4 rounded-xl bg-surface-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="micro-label text-text-secondary">Your Self-Evaluation</span>
                      <StarRating value={cycle.selfRating} readOnly size="sm" />
                    </div>
                    <p className="text-xs text-text leading-relaxed italic">
                      "{cycle.selfAssessment}"
                    </p>
                  </div>

                  {/* Manager Feedback Card */}
                  <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="micro-label text-primary">Manager Appraisal ({currentUser.manager})</span>
                      {cycle.managerRating ? (
                        <StarRating value={cycle.managerRating} readOnly size="sm" />
                      ) : (
                        <span className="text-[11px] text-text-tertiary">In Review</span>
                      )}
                    </div>
                    <p className="text-xs text-text leading-relaxed">
                      {cycle.managerFeedback ||
                        'Manager review is in progress. Feedback will be finalized by the Q1 cycle deadline.'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Submit Self-Review Modal */}
      <Modal
        isOpen={!!activeCycleModal}
        onClose={() => setActiveCycleModal(null)}
        title={`Self-Appraisal · ${selectedCycle?.title}`}
        subtitle="Evaluate your quarterly goals, architecture milestones and peer mentorship"
      >
        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Self-Review Submitted</h4>
            <p className="text-xs text-text-secondary">
              Your self-assessment has been shared with your tech lead for evaluation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1.5">
                Overall Self-Rating (1 to 5 Stars)
              </label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Detailed Self-Assessment (Minimum 10 characters)
              </label>
              <textarea
                rows={5}
                required
                minLength={10}
                value={assessment}
                onChange={e => setAssessment(e.target.value)}
                placeholder="Highlight key engineering accomplishments, high-scale system migrations, customer impact, and areas for continuous development..."
                className="w-full p-3.5 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
              />
              <span className="text-[11px] text-text-tertiary block mt-1">
                {assessment.length} characters entered (min 10)
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveCycleModal(null)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assessment.length < 10}
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm disabled:opacity-40"
              >
                Submit Self-Review →
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
