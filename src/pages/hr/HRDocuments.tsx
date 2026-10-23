import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Shield,
  Clock,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { MasterDetail } from '../../components/ui/MasterDetail';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DocumentItem } from '../../types';

export const HRDocuments: React.FC = () => {
  const { documents, verifyDocument } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'all'>('pending');
  const [selectedDocId, setSelectedDocId] = useState<string | null>('DOC-UP-01');

  const pendingDocs = documents.filter(d => d.status === 'Pending review');
  const verifiedDocs = documents.filter(d => d.status === 'Verified');

  const displayedDocs =
    activeTab === 'pending'
      ? pendingDocs
      : activeTab === 'verified'
      ? verifiedDocs
      : documents;

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Document Verification' }]}
        title="Document Verification Queue"
        subtitle="Review uploaded employee identity papers, state driver licenses, and technical certificates"
        tabs={[
          { id: 'pending', label: 'Pending Verification', count: pendingDocs.length },
          { id: 'verified', label: 'Verified Records', count: verifiedDocs.length },
          { id: 'all', label: 'All Documents', count: documents.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      <MasterDetail
        hasSelection={!!selectedDoc}
        onClearSelection={() => setSelectedDocId(null)}
        title={selectedDoc ? `Document Verification · ${selectedDoc.id}` : 'Select a document'}
        master={
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
            {displayedDocs.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-secondary">
                ✓ No documents pending review.
              </div>
            ) : (
              displayedDocs.map(doc => {
                const isSelected = selectedDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-4 cursor-pointer transition-colors space-y-2 ${
                      isSelected ? 'bg-primary-50/50 dark:bg-primary-50/20' : 'hover:bg-surface-muted/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text">{doc.title}</span>
                      </div>
                      <StatusBadge
                        variant={
                          doc.status === 'Verified'
                            ? 'success'
                            : doc.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {doc.status}
                      </StatusBadge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span className="font-mono">{doc.fileName}</span>
                      <span>Uploaded {doc.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        }
        detail={
          selectedDoc ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Document Title:</span>
                  <span className="font-bold text-text truncate max-w-xs">{selectedDoc.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Category:</span>
                  <span className="text-text">{selectedDoc.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">File Name:</span>
                  <span className="font-mono text-primary">{selectedDoc.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Current Status:</span>
                  <StatusBadge
                    variant={
                      selectedDoc.status === 'Verified'
                        ? 'success'
                        : selectedDoc.status === 'Rejected'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {selectedDoc.status}
                  </StatusBadge>
                </div>
              </div>

              {/* Preview Window Simulator */}
              <div className="p-6 rounded-xl border border-dashed border-border bg-surface text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-text">{selectedDoc.fileName}</h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Encrypted PDF Document · {selectedDoc.size}
                  </p>
                </div>
                <button
                  onClick={() => alert(`Opening secure viewer for ${selectedDoc.fileName}`)}
                  className="h-8 px-4 rounded-btn border border-border text-xs font-semibold text-text hover:bg-surface-muted"
                >
                  Open in Document Viewer
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <button
                  onClick={() => alert(`Downloading archive copy of ${selectedDoc.fileName}`)}
                  className="text-xs font-semibold text-text-secondary hover:text-text flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => verifyDocument(selectedDoc.id, 'Rejected')}
                    className="h-8 px-3 rounded-btn border border-[#C81E3A] text-[#C81E3A] hover:bg-[#FDECEF] text-xs font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => verifyDocument(selectedDoc.id, 'Verified')}
                    className="h-8 px-4 rounded-btn bg-[#15803D] hover:bg-[#126b33] text-white text-xs font-semibold shadow-sm"
                  >
                    Verify Document ✓
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
