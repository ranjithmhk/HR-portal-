import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { MasterDetail } from '../../components/ui/MasterDetail';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { IssueReport } from '../../types';

export const WhistleBlower: React.FC = () => {
  const { issueReports, updateIssueStatus } = useStore();

  const [selectedToken, setSelectedToken] = useState<string | null>('WB-7829-9182');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');

  const selectedReport = issueReports.find(i => i.token === selectedToken) || issueReports[0];

  const handleUpdate = (status: IssueReport['status']) => {
    if (!selectedReport) return;
    updateIssueStatus(selectedReport.token, status, internalNoteInput || undefined, resolutionInput || undefined);
    setInternalNoteInput('');
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Whistle Blower' }]}
        title="Whistleblower & Ethics Governance Queue"
        subtitle="Confidential ethics reports, financial audit investigations, and formal resolutions"
      />

      <MasterDetail
        hasSelection={!!selectedReport}
        onClearSelection={() => setSelectedToken(null)}
        title={selectedReport ? `Case ${selectedReport.token} · ${selectedReport.category}` : 'Select Case'}
        master={
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
            {issueReports.map(rep => {
              const isSelected = selectedToken === rep.token;

              return (
                <div
                  key={rep.token}
                  onClick={() => setSelectedToken(rep.token)}
                  className={`p-4 cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-primary-50/50 dark:bg-primary-50/20' : 'hover:bg-surface-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{rep.token}</span>
                    <StatusBadge
                      variant={
                        rep.status === 'Resolved'
                          ? 'success'
                          : rep.status === 'Under Investigation'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {rep.status}
                    </StatusBadge>
                  </div>

                  <h4 className="font-bold text-xs text-text line-clamp-1">{rep.subject}</h4>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                    <span>{rep.category}</span>
                    <span className="font-mono">{rep.createdDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        }
        detail={
          selectedReport ? (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Token:</span>
                  <span className="font-mono font-bold text-primary">{selectedReport.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Category:</span>
                  <span className="font-semibold text-text">{selectedReport.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Lead Investigator:</span>
                  <span className="font-semibold text-text">{selectedReport.assignee || 'Ethics Board'}</span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <span className="micro-label text-text-secondary">Report Description</span>
                <p className="p-3.5 rounded-xl bg-surface border border-border text-xs leading-relaxed text-text">
                  {selectedReport.description}
                </p>
              </div>

              {/* Evidence Files */}
              {selectedReport.evidenceFiles.length > 0 && (
                <div className="space-y-1">
                  <span className="micro-label text-text-secondary">Attached Evidence</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.evidenceFiles.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-surface-muted border border-border text-xs text-primary font-mono flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Notes History */}
              {selectedReport.internalNotes && (
                <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-50/20 border border-primary-100 text-xs space-y-1">
                  <span className="font-bold text-primary block">Investigative Audit Notes:</span>
                  <p className="text-text leading-relaxed">{selectedReport.internalNotes}</p>
                </div>
              )}

              {/* Add Note & Resolution Form */}
              <div className="space-y-3 pt-2 border-t border-border">
                <textarea
                  rows={2}
                  placeholder="Append confidential audit note..."
                  value={internalNoteInput}
                  onChange={e => setInternalNoteInput(e.target.value)}
                  className="w-full p-2.5 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleUpdate('Under Investigation')}
                    className="h-8 px-3 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
                  >
                    Mark Investigating
                  </button>
                  <button
                    onClick={() => handleUpdate('Resolved')}
                    className="h-8 px-4 rounded-btn bg-[#15803D] hover:bg-[#126b33] text-white text-xs font-semibold shadow-sm"
                  >
                    Mark Case Resolved ✓
                  </button>
                </div>
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
};
