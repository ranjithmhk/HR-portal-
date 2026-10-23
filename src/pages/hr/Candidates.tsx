import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  FileCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MoreVertical,
  ExternalLink,
  Shield,
  Download,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { Candidate } from '../../types';

export const Candidates: React.FC = () => {
  const { candidates, addCandidate, verifyCandidateI9 } = useStore();

  const [isOnboardDrawerOpen, setIsOnboardDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [i9ModalCandidate, setI9ModalCandidate] = useState<Candidate | null>(null);

  // New Candidate Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Senior Cloud Engineer');
  const [department, setDepartment] = useState('Engineering');
  const [workLocation, setWorkLocation] = useState('Dallas, TX (US)');
  const [success, setSuccess] = useState(false);

  const totalCandidates = candidates.length;
  const pendingOfferCount = candidates.filter(c => c.status === 'Pending Offer').length;
  const inProgressCount = candidates.filter(c => c.status === 'In Progress').length;
  const completedCount = candidates.filter(c => c.status === 'Completed').length;

  const statItems: StatItem[] = [
    {
      icon: <UserPlus className="w-4 h-4" />,
      label: 'Total Candidates',
      value: totalCandidates,
      delta: { text: '+2 this week', positive: true },
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Pending Offer',
      value: pendingOfferCount,
      delta: { text: 'Needs Admin sign-off', neutral: true },
      hasGradientAccent: true,
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: 'Onboarding In Progress',
      value: inProgressCount,
      delta: { text: 'Tasks underway', neutral: true },
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: 'Fully Completed',
      value: completedCount,
      delta: { text: 'Ready for orientation', positive: true },
    },
  ];

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addCandidate({
      name,
      email,
      role,
      department,
      workLocation,
      status: 'Pending Offer',
      i9Section2Status: 'Not Started',
      offerLetterStatus: 'Pending Admin',
    });

    setSuccess(true);
    setName('');
    setEmail('');
    setTimeout(() => {
      setSuccess(false);
      setIsOnboardDrawerOpen(false);
    }, 1500);
  };

  const handleVerifyI9 = () => {
    if (i9ModalCandidate) {
      verifyCandidateI9(i9ModalCandidate.id);
      setI9ModalCandidate(null);
    }
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Candidate Onboarding' }]}
        title="Candidate Onboarding & I-9 Verification"
        subtitle="Manage prospective hires, legal offer execution, form I-9 compliance and document vaults"
        actions={
          <button
            onClick={() => setIsOnboardDrawerOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            <span>Onboard Candidate</span>
          </button>
        }
      />

      {/* Stat Strip */}
      <StatStrip stats={statItems} />

      {/* Candidates Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Active Candidates ({candidates.length})
          </h3>
          <span className="text-xs text-text-tertiary">Track progress out of 18 tasks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Candidate</th>
                <th className="px-4 py-3">Role & Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-40">Task Progress</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">I-9 Section 2</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map(candidate => {
                const percent = Math.round((candidate.tasksProgress / candidate.tasksTotal) * 100);

                return (
                  <tr key={candidate.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-text">{candidate.name}</p>
                          <p className="text-[11px] text-text-tertiary">{candidate.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{candidate.role}</p>
                      <p className="text-[11px] text-text-secondary">{candidate.workLocation}</p>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          candidate.status === 'Completed'
                            ? 'success'
                            : candidate.status === 'In Progress'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {candidate.status}
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-text">
                            {candidate.tasksProgress}/{candidate.tasksTotal}
                          </span>
                          <span className="font-bold text-primary">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-muted overflow-hidden">
                          <div
                            className="h-full hero-gradient rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-text-secondary">
                      {candidate.createdDate}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          candidate.i9Section2Status === 'Completed'
                            ? 'success'
                            : candidate.i9Section2Status === 'Pending'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {candidate.i9Section2Status}
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {candidate.i9Section2Status === 'Pending' && (
                          <button
                            onClick={() => setI9ModalCandidate(candidate)}
                            className="h-7 px-2.5 rounded text-[11px] font-semibold bg-primary-50 text-primary hover:bg-primary-100"
                          >
                            Verify I-9
                          </button>
                        )}
                        <button
                          onClick={() => alert(`Viewing signed offer package for ${candidate.name}`)}
                          className="p-1.5 text-text-secondary hover:text-text rounded hover:bg-surface-muted"
                          title="View Signed PDF"
                        >
                          <FileCheck className="w-4 h-4 text-[#15803D]" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Candidate Drawer */}
      <Drawer
        isOpen={isOnboardDrawerOpen}
        onClose={() => setIsOnboardDrawerOpen(false)}
        title="Onboard New Candidate"
        subtitle="Initiate pre-hire onboarding checklist and legal offer workflow"
      >
        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Candidate Enrolled</h4>
            <p className="text-xs text-text-secondary">
              An invitation to complete the 18-step onboarding portal has been sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rachel Adams"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Personal Email</label>
              <input
                type="email"
                required
                placeholder="e.g. rachel.adams@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block micro-label text-text-secondary mb-1">Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Primary Work Location
              </label>
              <select
                value={workLocation}
                onChange={e => setWorkLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Dallas, TX (US)">Dallas, TX (US HQ)</option>
                <option value="Austin, TX (US)">Austin, TX (US)</option>
                <option value="Chicago, IL (US)">Chicago, IL (US)</option>
                <option value="Hyderabad, TS (IN)">Hyderabad, TS (India)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOnboardDrawerOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
              >
                Save & Dispatch Portal Link →
              </button>
            </div>
          </form>
        )}
      </Drawer>

      {/* I-9 Section 2 In-Person Verification Modal */}
      <Modal
        isOpen={!!i9ModalCandidate}
        onClose={() => setI9ModalCandidate(null)}
        title="Form I-9 Section 2 Verification"
        subtitle={`Employer Review and Physical Attestation for ${i9ModalCandidate?.name}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs text-text-secondary space-y-1">
            <p className="font-bold text-text">USCIS Regulatory Requirement:</p>
            <p>
              Under US Federal law, the employer must physically examine List A (or List B + List C) original documents within 3 business days of first date of employment.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-surface text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Document Examined:</span>
              <span className="font-bold text-text">US Passport #•••• 9102</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Issuing Authority:</span>
              <span className="font-semibold text-text">US Department of State</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Expiration Date:</span>
              <span className="font-mono text-text">14 Nov 2032</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setI9ModalCandidate(null)}
              className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyI9}
              className="h-9 px-5 rounded-btn bg-[#15803D] hover:bg-[#126b33] text-white text-xs font-semibold shadow-sm"
            >
              Attest & Mark I-9 Completed →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
