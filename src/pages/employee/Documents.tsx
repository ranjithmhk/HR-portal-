import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  DollarSign,
  Shield,
  FileCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { FileDropzone } from '../../components/ui/FileDropzone';
import { DocumentItem } from '../../types';

export const Documents: React.FC = () => {
  const { documents, uploadDocument, currentUser } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload modal state
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('My Uploads');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories: Array<{ id: string; label: string; count: number }> = [
    { id: 'All', label: 'All Documents', count: documents.length },
    {
      id: 'Required Documents',
      label: 'Required Documents',
      count: documents.filter(d => d.category === 'Required Documents').length,
    },
    {
      id: 'HR Documents',
      label: 'HR Documents',
      count: documents.filter(d => d.category === 'HR Documents').length,
    },
    {
      id: 'Payslips',
      label: 'Payslips (CY 2026)',
      count: documents.filter(d => d.category === 'Payslips').length,
    },
    {
      id: 'My Uploads',
      label: 'My Uploads',
      count: documents.filter(d => d.category === 'My Uploads').length,
    },
  ];

  const filteredDocs = documents.filter(d => {
    if (activeCategory === 'All') return true;
    return d.category === activeCategory;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !uploadedFile) return;

    const sizeKB = (uploadedFile.size / 1024).toFixed(0);
    const sizeMB = (uploadedFile.size / (1024 * 1024)).toFixed(1);

    uploadDocument({
      title: docTitle,
      category: docCategory,
      fileName: uploadedFile.name,
      size: uploadedFile.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`,
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadModalOpen(false);
      setDocTitle('');
      setUploadedFile(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Documents' }]}
        title={`My Documents · ${documents.length} verified documents`}
        subtitle="Access mandatory legal compliance contracts, compensation letters, and verified payslips"
        actions={
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Upload className="w-4 h-4" strokeWidth={1.75} />
            <span>Upload Document</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Section Index (4/12) */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <Card className="space-y-2 p-3">
            <span className="micro-label text-text-secondary px-2 pt-1 block">
              Document Archives
            </span>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary-50 text-primary font-bold shadow-sm'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Secure Storage Callout */}
          <Card variant="ink" className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="w-4 h-4" strokeWidth={1.75} />
              <span className="text-xs font-bold uppercase tracking-wider text-text">
                AES-256 Vault Encryption
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              All tax forms, passports, and payslips are stored in SOC 2 Type II certified encrypted cloud storage with strict role-based access.
            </p>
          </Card>
        </aside>

        {/* Right Content Area (8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-text">
                {activeCategory} ({filteredDocs.length})
              </h3>
              <span className="text-xs text-text-tertiary">Signed & Finalized</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                    <th className="px-5 py-3">File / Document Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Gross / Date</th>
                    <th className="px-4 py-3">Verification Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-text truncate">{doc.title}</p>
                            <p className="text-[11px] text-text-tertiary font-mono">
                              {doc.fileName} · {doc.size}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-text-secondary">{doc.category}</td>

                      <td className="px-4 py-3 font-mono">
                        {doc.grossAmount ? (
                          <div>
                            <span className="font-bold text-text">{doc.grossAmount}</span>
                            <span className="block text-[10px] font-bold text-[#15803D] uppercase">
                              FINALISED
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-secondary">{doc.date}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
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
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert(`Opening preview of ${doc.fileName}`)}
                            className="p-1.5 text-text-secondary hover:text-primary rounded hover:bg-surface-muted"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={() => alert(`Downloading ${doc.fileName}`)}
                            className="p-1.5 text-text-secondary hover:text-primary rounded hover:bg-surface-muted"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
        subtitle="Add a verification file to your employee record"
      >
        {uploadSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Document Uploaded</h4>
            <p className="text-xs text-text-secondary">
              Your document has been sent to HR for verification review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Document Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Certification Verification or Tax Form"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Category</label>
              <select
                value={docCategory}
                onChange={e => setDocCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="My Uploads">My Uploads</option>
                <option value="Required Documents">Required Documents</option>
                <option value="HR Documents">HR Documents</option>
              </select>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1.5">File</label>
              <FileDropzone
                onFileSelect={file => setUploadedFile(file)}
                label="Select document to upload"
                subtext="PDF, PNG, JPG (max 20 MB)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!uploadedFile || !docTitle.trim()}
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm disabled:opacity-40"
              >
                Upload & Submit →
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
