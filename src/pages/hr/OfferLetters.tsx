import React, { useState } from 'react';
import {
  FileText,
  Send,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { MasterDetail } from '../../components/ui/MasterDetail';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { OfferLetter } from '../../types';

export const OfferLetters: React.FC = () => {
  const { offerLetters, generateOfferLetter, approveOfferLetter } = useStore();

  const [selectedOfferId, setSelectedOfferId] = useState<string | null>('OFF-1092');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate form
  const [candidateName, setCandidateName] = useState('Emily Watson');
  const [role, setRole] = useState('Lead ML Engineer');
  const [department, setDepartment] = useState('Data Science');
  const [salary, setSalary] = useState('$165,000 / year');
  const [startDate, setStartDate] = useState('16 Nov 2026');
  const [location, setLocation] = useState('Austin, TX (US)');
  const [success, setSuccess] = useState(false);

  const selectedOffer = offerLetters.find(o => o.id === selectedOfferId) || offerLetters[0];

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    generateOfferLetter({
      candidateId: `CND-${Math.floor(8880 + Math.random() * 50)}`,
      candidateName,
      role,
      department,
      salary,
      startDate,
      location,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Offer Letters' }]}
        title="Candidate Offer Letters & Contracts"
        subtitle="Generate, preview, and track executive sign-offs for prospective new hires"
        actions={
          <button
            onClick={() => setIsGenerating(!isGenerating)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
          >
            {isGenerating ? 'View Template' : '+ Generate Offer Letter'}
          </button>
        }
      />

      <MasterDetail
        hasSelection={!!selectedOffer}
        onClearSelection={() => setSelectedOfferId(null)}
        title={selectedOffer ? `Offer Document · ${selectedOffer.id}` : 'Select an offer'}
        master={
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
            {offerLetters.map(letter => {
              const isSelected = selectedOfferId === letter.id;

              return (
                <div
                  key={letter.id}
                  onClick={() => {
                    setSelectedOfferId(letter.id);
                    setIsGenerating(false);
                  }}
                  className={`p-4 cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-primary-50/50' : 'hover:bg-surface-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-text">{letter.candidateName}</span>
                    <StatusBadge
                      variant={
                        letter.status === 'Completed'
                          ? 'success'
                          : letter.status === 'Pending Admin'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {letter.status}
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-text-secondary">
                    {letter.role} · {letter.department}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-text-tertiary">
                    <span className="font-mono">{letter.id}</span>
                    <span>Date: {letter.generatedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        }
        detail={
          isGenerating ? (
            /* Generate Flow */
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <h4 className="font-heading font-bold text-sm text-text">Generate New Offer Letter</h4>

              {success && (
                <div className="p-3 rounded-lg bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Offer generated and dispatched for Admin approval!
                </div>
              )}

              <div>
                <label className="block micro-label text-text-secondary mb-1">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  className="w-full h-9 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full h-9 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block micro-label text-text-secondary mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full h-9 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Data Science">Data Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block micro-label text-text-secondary mb-1">Base Compensation</label>
                  <input
                    type="text"
                    required
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    className="w-full h-9 px-3 rounded-input border border-border bg-surface text-xs font-mono font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block micro-label text-text-secondary mb-1">Start Date</label>
                  <input
                    type="text"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerating(false)}
                  className="h-8 px-3 rounded-btn border border-border text-xs text-text-secondary hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                >
                  Generate PDF & Route →
                </button>
              </div>
            </form>
          ) : (
            /* Live Offer Letter Template Preview */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-border shadow-sm space-y-3 font-serif text-xs text-text leading-relaxed">
                <div className="border-b border-border pb-3 flex items-center justify-between not-italic font-sans">
                  <span className="font-heading font-extrabold text-sm text-text">
                    MHK TECH INC. · FORMAL OFFER
                  </span>
                  <span className="font-mono text-[11px] text-text-tertiary">{selectedOffer.id}</span>
                </div>

                <p className="font-sans text-[11px] text-text-tertiary">
                  Date: {selectedOffer.generatedDate}
                </p>

                <p>
                  Dear <strong className="font-sans font-bold">{selectedOffer.candidateName}</strong>,
                </p>

                <p>
                  On behalf of MHK Tech Inc., we are delighted to offer you the position of{' '}
                  <strong className="font-sans font-bold">{selectedOffer.role}</strong> within the{' '}
                  <strong className="font-sans font-bold">{selectedOffer.department}</strong>{' '}
                  organization.
                </p>

                <div className="p-3 rounded-lg bg-surface-muted border border-border font-sans text-xs space-y-1.5 not-italic">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Base Annual Compensation:</span>
                    <span className="font-bold font-mono text-text">{selectedOffer.salary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Official Effective Start Date:</span>
                    <span className="font-semibold text-text">{selectedOffer.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Work Location:</span>
                    <span className="text-text">{selectedOffer.location}</span>
                  </div>
                </div>

                <p className="text-[11px] text-text-secondary pt-2">
                  This offer is contingent upon successful completion of background checks and Form I-9 employment eligibility verification.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => alert(`Downloading formal PDF for ${selectedOffer.candidateName}`)}
                  className="h-8 px-3 rounded-btn border border-border bg-surface text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-muted"
                >
                  <Download className="w-3.5 h-3.5 text-text-tertiary" /> Download PDF
                </button>

                {selectedOffer.status === 'Pending Admin' && (
                  <button
                    onClick={() => approveOfferLetter(selectedOffer.id)}
                    className="h-8 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
                  >
                    Approve Offer (COO Sign-off) →
                  </button>
                )}
              </div>
            </div>
          )
        }
      />
    </div>
  );
};
