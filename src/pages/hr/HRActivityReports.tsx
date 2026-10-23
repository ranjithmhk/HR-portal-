import React, { useState } from 'react';
import {
  Mic,
  Search,
  Download,
  Calendar,
  Sparkles,
  FileText,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { MasterDetail } from '../../components/ui/MasterDetail';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActivityReport } from '../../types';

export const HRActivityReports: React.FC = () => {
  const { activityReports } = useStore();

  const [search, setSearch] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>('AR-2026-W42');

  const filteredReports = activityReports.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.submittedBy.toLowerCase().includes(q) ||
      r.accomplishments.toLowerCase().includes(q) ||
      r.period.toLowerCase().includes(q)
    );
  });

  const selectedReport = activityReports.find(r => r.id === selectedReportId) || activityReports[0];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Activity Reports' }]}
        title="Engineering Activity Reports & Deliverables"
        subtitle="Review AI-structured voice transcripts and progress reports from technical contributors"
      />

      <MasterDetail
        hasSelection={!!selectedReport}
        onClearSelection={() => setSelectedReportId(null)}
        title={selectedReport ? `${selectedReport.submittedBy} · ${selectedReport.period}` : 'Select Report'}
        master={
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search reports by author or project..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-input border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
              {filteredReports.map(rep => {
                const isSelected = selectedReportId === rep.id;

                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`p-4 cursor-pointer transition-colors space-y-2 ${
                      isSelected ? 'bg-primary-50/50 dark:bg-primary-50/20' : 'hover:bg-surface-muted/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text">{rep.submittedBy}</span>
                        <StatusBadge variant="info" size="sm">{rep.type}</StatusBadge>
                      </div>
                      <span className="font-mono text-[11px] text-text-tertiary">{rep.date}</span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {rep.accomplishments}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        }
        detail={
          selectedReport ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Author:</span>
                  <span className="font-bold text-text">{selectedReport.submittedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Cadence:</span>
                  <span className="font-semibold text-text">{selectedReport.type} Report ({selectedReport.period})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <StatusBadge variant={selectedReport.status === 'Submitted' ? 'success' : 'neutral'} size="sm">
                    {selectedReport.status}
                  </StatusBadge>
                </div>
              </div>

              {/* Accomplishments */}
              <div className="space-y-1.5">
                <span className="micro-label text-text-secondary">Key Accomplishments</span>
                <div className="p-3.5 rounded-xl bg-surface border border-border text-xs leading-relaxed text-text">
                  {selectedReport.accomplishments}
                </div>
              </div>

              {/* Blockers */}
              <div className="space-y-1.5">
                <span className="micro-label text-text-secondary">Blockers & Dependencies</span>
                <div className="p-3.5 rounded-xl bg-surface border border-border text-xs leading-relaxed text-text">
                  {selectedReport.blockers || 'None reported.'}
                </div>
              </div>

              {/* Next Priorities */}
              <div className="space-y-1.5">
                <span className="micro-label text-text-secondary">Next Sprint Priorities</span>
                <div className="p-3.5 rounded-xl bg-surface border border-border text-xs leading-relaxed text-text">
                  {selectedReport.nextPriorities}
                </div>
              </div>

              {/* Voice Transcript (if available) */}
              {selectedReport.transcript && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Mic className="w-3.5 h-3.5" />
                    <span className="micro-label text-primary font-bold">Original Voice Dictation</span>
                  </div>
                  <p className="p-3 rounded-lg bg-surface-muted border border-border text-[11px] text-text-secondary italic leading-relaxed">
                    "{selectedReport.transcript}"
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => alert(`Exporting report ${selectedReport.id}`)}
                  className="h-8 px-4 rounded-btn border border-border bg-surface text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-muted"
                >
                  <Download className="w-3.5 h-3.5 text-text-tertiary" /> Export PDF
                </button>
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
};
