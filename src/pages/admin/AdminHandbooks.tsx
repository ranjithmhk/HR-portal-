import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  UploadCloud,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { FileDropzone } from '../../components/ui/FileDropzone';
import { HandbookSection } from '../../types';

export const AdminHandbooks: React.FC = () => {
  const {
    handbookSections,
    handbookDraftSections,
    handbookVersion,
    updateDraftSection,
    addDraftSection,
    deleteDraftSection,
    publishHandbookDraft,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'draft' | 'published'>('draft');
  const [editingSection, setEditingSection] = useState<HandbookSection | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Edit modal fields
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Add modal fields
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Company Overview & Culture');

  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleOpenEdit = (section: HandbookSection) => {
    setEditingSection(section);
    setEditTitle(section.title);
    setEditContent(section.content);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    updateDraftSection(editingSection.id, editTitle, editContent);
    setEditingSection(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addDraftSection(newTitle, newContent, newCategory);
    setIsAddOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  const handlePublish = () => {
    if (confirm('Publishing will increment the official Handbook version and require all employees to re-acknowledge. Proceed?')) {
      publishHandbookDraft();
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/overview' }, { label: 'Handbook Governance' }]}
        title="Employee Handbook Publishing & Section Editor"
        subtitle={`Current live version: ${handbookVersion} · Draft staging buffer allows isolated legal updates`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="h-9 px-3.5 rounded-btn border border-border bg-surface text-text hover:bg-surface-muted text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-primary" strokeWidth={2} />
              <span>+ Add Section</span>
            </button>
            <button
              onClick={handlePublish}
              className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
            >
              Publish New Edition →
            </button>
          </div>
        }
        tabs={[
          { id: 'draft', label: 'US Draft Workspace (75 sections)', count: handbookDraftSections.length },
          { id: 'published', label: `Published Live (${handbookVersion})`, count: handbookSections.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      {publishSuccess && (
        <div className="p-4 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>
            New edition published! Employee portal updated and re-acknowledgement notifications broadcast.
          </span>
        </div>
      )}

      {/* PDF Dropzone Header Callout */}
      {activeTab === 'draft' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-base text-text">
                Replace US Draft from Legal PDF
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 max-w-xl">
                The PDF is split into sections automatically. Nothing employees or AI bots see changes until you click <strong>Publish</strong>.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary">
              Staging Sandbox
            </span>
          </div>

          <FileDropzone
            onFileSelect={file => alert(`Parsing sections from ${file.name}`)}
            label="Drop updated US Legal PDF to replace draft sections"
            subtext="AI parses headings, clauses, and numbering automatically"
          />
        </Card>
      )}

      {/* Sections List */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            {activeTab === 'draft' ? 'US Draft Sections (75)' : `Live Published Sections (${handbookVersion})`}
          </h3>
          <span className="text-xs text-text-tertiary">Governing corporate policies</span>
        </div>

        <div className="divide-y divide-border">
          {(activeTab === 'draft' ? handbookDraftSections : handbookSections).map(section => (
            <div
              key={section.id}
              className="p-4 flex items-start justify-between gap-4 hover:bg-primary-50/20 transition-colors"
            >
              <div className="space-y-1 min-w-0 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-text">{section.title}</span>
                  <span className="text-[10px] text-text-tertiary font-mono">
                    {section.charCount} chars
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {section.content}
                </p>
                <span className="text-[10px] font-medium text-text-tertiary">
                  Category: {section.category}
                </span>
              </div>

              {activeTab === 'draft' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(section)}
                    className="p-1.5 text-text-secondary hover:text-primary rounded hover:bg-surface-muted"
                    title="Edit Section"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDraftSection(section.id)}
                    className="p-1.5 text-text-tertiary hover:text-[#C81E3A] rounded hover:bg-[#FDECEF]"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Draft Section Modal */}
      <Modal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        title="Edit Draft Section"
        subtitle="Saves to the draft only — nothing changes for employees until you publish"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block micro-label text-text-secondary mb-1">Section Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="micro-label text-text-secondary">Section Content</label>
              <span className="text-[11px] font-mono text-text-tertiary">
                {editContent.length} chars
              </span>
            </div>
            <textarea
              rows={6}
              required
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingSection(null)}
              className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
            >
              Save Changes to Draft →
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Draft Section"
        subtitle="Create a new policy section in the draft staging buffer"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block micro-label text-text-secondary mb-1">Section Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 7.1 Artificial Intelligence & LLM Usage Ethics"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block micro-label text-text-secondary mb-1">Category</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Company Overview & Culture">Company Overview & Culture</option>
              <option value="Workplace Norms & Hours">Workplace Norms & Hours</option>
              <option value="Time Off & Leaves">Time Off & Leaves</option>
              <option value="Ethics & Compliance">Ethics & Compliance</option>
              <option value="IT, Security & Data Protection">IT, Security & Data Protection</option>
            </select>
          </div>

          <div>
            <label className="block micro-label text-text-secondary mb-1">Content</label>
            <textarea
              rows={5}
              required
              placeholder="Draft legal clause text..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
            >
              Add to Draft →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
