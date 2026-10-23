import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Upload,
  PenTool,
  Clock,
  Shield,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const Onboarding: React.FC = () => {
  const { currentUser } = useStore();

  const [completedTasks, setCompletedTasks] = useState<{ [id: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    14: true,
  });

  const [activeModalTask, setActiveModalTask] = useState<any | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [signedSuccess, setSignedSuccess] = useState(false);

  const onboardingChecklist = [
    { id: 1, title: 'Sign Formal Offer Letter & Position Acceptance', category: 'Legal & Offer', type: 'sign' },
    { id: 2, title: 'Form I-9 Section 1: Employee Information & Attestation', category: 'Compliance', type: 'sign' },
    { id: 3, title: 'Upload Government Issued Photo ID & Passport Copy', category: 'Verification', type: 'upload' },
    { id: 4, title: 'Direct Deposit Authorization Form (Bank Routing & Account)', category: 'Payroll', type: 'form' },
    { id: 5, title: 'Federal Form W-4 Employee Withholding Certificate', category: 'Payroll', type: 'form' },
    { id: 6, title: 'Confidentiality, Proprietary Rights & NDA Agreement', category: 'Legal', type: 'sign' },
    { id: 7, title: 'Employee Handbook v4 Policy Acknowledgement', category: 'Compliance', type: 'sign' },
    { id: 8, title: 'Emergency Contact & Beneficiary Designation', category: 'HR Info', type: 'form' },
    { id: 9, title: 'Medical, Dental & Vision Insurance Enrollment Election', category: 'Benefits', type: 'form' },
    { id: 10, title: '401(k) Retirement Savings & Employer Match Selection', category: 'Benefits', type: 'form' },
    { id: 11, title: 'Multi-Factor Authentication (Okta / Hardware Key) Setup', category: 'IT Security', type: 'setup' },
    { id: 12, title: 'Corporate Laptop & Workstation Hardware Receipt Confirmation', category: 'IT', type: 'sign' },
    { id: 13, title: 'Complete Mandatory Security Awareness & Phishing Training', category: 'Security', type: 'training' },
    { id: 14, title: 'Review Code of Conduct & Anti-Harassment Guidelines', category: 'Compliance', type: 'sign' },
    { id: 15, title: 'Form I-9 Section 2: Physical Document Verification with HR', category: 'HR In-Person', type: 'verify' },
    { id: 16, title: 'Setup GitHub Enterprise & AWS IAM Developer Permissions', category: 'Engineering', type: 'setup' },
    { id: 17, title: 'Attend 30-Day New Hire Check-In with Ananya Sharma', category: 'HR Check-In', type: 'meeting' },
    { id: 18, title: 'Finalize 90-Day Engineering Objectives & Key Deliverables', category: 'Tenure Goal', type: 'goal' },
  ];

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / onboardingChecklist.length) * 100);

  const toggleTask = (id: number) => {
    setCompletedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEsign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !activeModalTask) return;

    setCompletedTasks(prev => ({ ...prev, [activeModalTask.id]: true }));
    setSignedSuccess(true);
    setTimeout(() => {
      setSignedSuccess(false);
      setActiveModalTask(null);
      setSignatureName('');
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Onboarding Checklist' }]}
        title="Employee Onboarding Checklist"
        subtitle={`18 Total Onboarding Steps · ${completedCount} of 18 Complete · Legal, payroll & IT milestones`}
      />

      {/* Progress Strip */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-text">Onboarding Progression</h3>
            <p className="text-xs text-text-secondary">
              {completedCount} tasks completed · {18 - completedCount} pending action
            </p>
          </div>
          <span className="font-heading font-extrabold text-2xl text-primary font-mono">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-surface-muted overflow-hidden border border-border">
          <div
            className="h-full hero-gradient rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Checklist Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Onboarding Tasks & Legal Attestations
          </h3>
          <span className="text-xs text-text-tertiary">All 18 items tracked for audit compliance</span>
        </div>

        <div className="divide-y divide-border">
          {onboardingChecklist.map(task => {
            const isDone = !!completedTasks[task.id];

            return (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-primary-50/20 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isDone
                        ? 'bg-[#15803D] border-[#15803D] text-white'
                        : 'border-border-strong hover:border-primary text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isDone ? 'line-through text-text-tertiary' : 'text-text'
                      }`}
                    >
                      {task.id}. {task.title}
                    </p>
                    <span className="text-[10px] text-text-tertiary font-medium">
                      Category: {task.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge variant={isDone ? 'success' : 'warning'} size="sm">
                    {isDone ? 'Completed' : 'Pending'}
                  </StatusBadge>

                  {!isDone && (
                    <button
                      onClick={() => setActiveModalTask(task)}
                      className="h-8 px-3 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                    >
                      {task.type === 'sign' ? 'E-Sign Now' : task.type === 'upload' ? 'Upload File' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* E-Sign / Action Modal */}
      <Modal
        isOpen={!!activeModalTask}
        onClose={() => setActiveModalTask(null)}
        title={activeModalTask?.title || 'Complete Onboarding Task'}
        subtitle="Electronic attestation legally binding under US ESIGN Act"
      >
        {signedSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Attestation Recorded</h4>
            <p className="text-xs text-text-secondary">
              Your electronic signature and timestamp have been permanently affixed to the record.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEsign} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-surface-muted text-xs leading-relaxed text-text-secondary border border-border">
              I, <strong className="text-text">{currentUser.name}</strong>, hereby attest that all information provided is accurate and truthful. I agree to electronically execute this document.
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Type Full Legal Name as Electronic Signature
              </label>
              <input
                type="text"
                required
                placeholder={currentUser.name}
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs font-serif italic text-text focus:outline-none focus:ring-2 focus:ring-primary text-base"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalTask(null)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!signatureName.trim()}
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm disabled:opacity-40"
              >
                Affix E-Signature →
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
