import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  Search,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FileDropzone } from '../../components/ui/FileDropzone';
import { IssueReport } from '../../types';

export const ReportIssue: React.FC = () => {
  const { issueReports, submitIssueReport } = useStore();

  const [activeTab, setActiveTab] = useState<'submit' | 'lookup'>('submit');

  // Form state
  const [category, setCategory] = useState<IssueReport['category']>('Ethics & Compliance');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Lookup state
  const [searchToken, setSearchToken] = useState('WB-7829-9182');
  const [lookedUpReport, setLookedUpReport] = useState<IssueReport | null>(() => {
    return issueReports.find(i => i.token === 'WB-7829-9182') || null;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 20 || !subject.trim()) return;

    const token = submitIssueReport({
      isAnonymous: true,
      category,
      subject,
      description,
      evidenceFiles,
    });

    setGeneratedToken(token);
    setSubject('');
    setDescription('');
    setEvidenceFiles([]);
  };

  const handleCopyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = issueReports.find(i => i.token.trim().toUpperCase() === searchToken.trim().toUpperCase());
    setLookedUpReport(found || null);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Ethics & Whistleblower' }]}
        title="Confidential Reporting & Whistleblower Channel"
        subtitle="Safe, encrypted reporting of ethical violations, accounting concerns, and compliance issues"
        tabs={[
          { id: 'submit', label: 'Submit Confidential Report' },
          { id: 'lookup', label: 'Track Status by Token', count: issueReports.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      {/* Anonymous-by-default Banner */}
      <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-text text-sm">Confidential & Anonymous by Default</p>
          <p className="text-text-secondary leading-relaxed">
            Your name, IP address, and identity are never stored in this pipeline. You will receive an encrypted tracking token upon submission to securely monitor investigation findings and responses.
          </p>
        </div>
      </div>

      {activeTab === 'submit' ? (
        <Card className="p-6 max-w-2xl mx-auto space-y-6">
          {generatedToken ? (
            /* Result Screen with Token */
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-[#E7F6EC] text-[#15803D] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
              </div>

              <div>
                <h3 className="font-heading font-bold text-lg text-text">Report Securely Filed</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                  Save your private tracking token below. You must use this token to check status or provide further evidence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-border inline-flex items-center gap-3">
                <span className="font-mono text-base font-extrabold text-primary tracking-wider">
                  {generatedToken}
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text transition-colors"
                  title="Copy token to clipboard"
                >
                  {copiedToken ? (
                    <Check className="w-4 h-4 text-[#15803D]" strokeWidth={2.5} />
                  ) : (
                    <Copy className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchToken(generatedToken);
                    setActiveTab('lookup');
                    setGeneratedToken(null);
                  }}
                  className="h-10 px-6 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                >
                  View Case in Tracker →
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Ethics & Compliance">Ethics & Regulatory Compliance</option>
                  <option value="Financial Irregularity">Accounting & Financial Irregularity</option>
                  <option value="Harassment or Discrimination">Harassment or Discrimination</option>
                  <option value="Safety">Workplace Safety & Security</option>
                  <option value="Other">Other Policy Violation</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="micro-label text-text-secondary">Subject / Case Summary</label>
                  <span className="text-[11px] font-mono text-text-tertiary">
                    {subject.length} / 200
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Summary of incident, department or policy involved..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="micro-label text-text-secondary">
                    Detailed Account of Incident (Min 20 characters)
                  </label>
                  <span className="text-[11px] font-mono text-text-tertiary">
                    {description.length} chars (min 20)
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  minLength={20}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Include dates, locations, witnesses, or specific contracts involved..."
                  className="w-full p-3.5 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
                />
              </div>

              {/* Evidence Upload */}
              <div>
                <label className="block micro-label text-text-secondary mb-1.5">
                  Supporting Evidence (Max 5 files, 10 MB each)
                </label>
                <FileDropzone
                  onFileSelect={file => setEvidenceFiles(prev => [...prev, file.name])}
                  label="Upload screenshots, email receipts or invoices"
                  subtext="PDF, PNG, JPG (metadata sanitized)"
                />

                {evidenceFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {evidenceFiles.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-surface-muted border border-border text-xs text-text font-mono flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" /> {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={description.length < 20 || !subject.trim()}
                  className="h-10 px-6 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm disabled:opacity-40"
                >
                  Submit Confidential Report →
                </button>
              </div>
            </form>
          )}
        </Card>
      ) : (
        /* Token Lookup Tab */
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-text">Look up Case Status</h3>
            <p className="text-xs text-text-secondary">
              Enter your tracking token below to view internal notes and resolution details.
            </p>

            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. WB-7829-9182"
                value={searchToken}
                onChange={e => setSearchToken(e.target.value)}
                className="flex-1 h-10 px-3.5 rounded-input border border-border bg-surface text-xs font-mono font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
              >
                Look up →
              </button>
            </form>
          </Card>

          {lookedUpReport ? (
            <Card className="p-6 space-y-4 border-primary-100 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="font-mono font-bold text-xs text-primary">{lookedUpReport.token}</span>
                  <h4 className="font-heading font-bold text-sm text-text mt-0.5">
                    {lookedUpReport.subject}
                  </h4>
                </div>
                <StatusBadge
                  variant={
                    lookedUpReport.status === 'Resolved'
                      ? 'success'
                      : lookedUpReport.status === 'Under Investigation'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {lookedUpReport.status}
                </StatusBadge>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted text-xs text-text-secondary leading-relaxed">
                {lookedUpReport.description}
              </div>

              {lookedUpReport.internalNotes && (
                <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-50/20 border border-primary-100 text-xs space-y-1">
                  <span className="font-bold text-primary block">Investigation Notes:</span>
                  <p className="text-text leading-relaxed">{lookedUpReport.internalNotes}</p>
                </div>
              )}

              {lookedUpReport.resolution && (
                <div className="p-3.5 rounded-xl bg-[#E7F6EC] text-xs space-y-1 border border-[#15803D]/20">
                  <span className="font-bold text-[#15803D] block">Remediation & Closure:</span>
                  <p className="text-text leading-relaxed">{lookedUpReport.resolution}</p>
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-tertiary">
                <span>Filed Date: {lookedUpReport.createdDate}</span>
                <span>Assignee: {lookedUpReport.assignee || 'Ethics Committee'}</span>
              </div>
            </Card>
          ) : (
            <div className="p-12 text-center text-xs text-text-secondary rounded-xl border border-dashed border-border bg-surface">
              No matching case found for this token. Verify spelling and re-enter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
