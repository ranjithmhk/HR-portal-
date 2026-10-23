import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const Handbook: React.FC = () => {
  const {
    handbookSections,
    handbookVersion,
    isHandbookAcknowledged,
    acknowledgeHandbook,
  } = useStore();

  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [id: string]: boolean }>({
    'hb-01': true,
    'hb-03': true,
    'hb-05': true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = Array.from(new Set(handbookSections.map(s => s.category)));

  const filteredSections = handbookSections.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: { [id: string]: boolean } = {};
    handbookSections.forEach(s => (all[s.id] = true));
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/employee/company/handbook#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Company Handbook' }]}
        title="Employee Handbook"
        subtitle={`${handbookVersion} · Published 5 Oct 2026 · 75 policy sections governing operations & conduct`}
        actions={
          <div className="flex items-center gap-3">
            {isHandbookAcknowledged ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E7F6EC] text-[#15803D] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                Acknowledged · {handbookVersion}
              </span>
            ) : (
              <button
                onClick={acknowledgeHandbook}
                className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-90"
              >
                Acknowledge {handbookVersion} Policy →
              </button>
            )}
          </div>
        }
      />

      {/* 2-Column Layout: Sticky Scroll-Spy TOC + Main Accordion Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Table of Contents (4/12) */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="micro-label text-text-secondary">Table of Contents</span>
              <span className="text-[11px] font-mono text-text-tertiary">75 sections</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-3 top-3" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search policy sections..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs rounded-input border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {categories.map(cat => {
                const catSections = filteredSections.filter(s => s.category === cat);
                if (catSections.length === 0) return null;

                return (
                  <div key={cat} className="pt-2 first:pt-0">
                    <p className="text-[11px] font-bold text-text uppercase tracking-wider mb-1 px-2">
                      {cat}
                    </p>
                    <div className="space-y-0.5">
                      {catSections.map(s => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          onClick={() => setExpandedSections(prev => ({ ...prev, [s.id]: true }))}
                          className="block px-2.5 py-1.5 rounded text-xs text-text-secondary hover:text-primary hover:bg-primary-50/50 transition-colors truncate"
                        >
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Guidelines Callout */}
          <Card variant="ink" className="space-y-2">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
              Statutory Compliance
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every employee is required to re-acknowledge whenever a major version increment occurs.
              All policies are maintained in accordance with US Federal, Texas Labor, and Indian Employment laws.
            </p>
          </Card>
        </aside>

        {/* Main Content Sections (8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-text-secondary pb-2 border-b border-border">
            <span>
              Showing {filteredSections.length} of {handbookSections.length} sections
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={expandAll}
                className="font-medium text-primary hover:underline"
              >
                Expand all
              </button>
              <span>·</span>
              <button
                onClick={collapseAll}
                className="font-medium text-text-secondary hover:text-text hover:underline"
              >
                Collapse all
              </button>
            </div>
          </div>

          {/* Accordion list */}
          <div className="space-y-3">
            {filteredSections.map(section => {
              const isOpen = !!expandedSections[section.id];

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm transition-all"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => toggleExpand(section.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-sm text-text truncate">
                          {section.title}
                        </h3>
                        <p className="text-[11px] text-text-tertiary">
                          {section.category} · {section.charCount} chars
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={e => handleCopyLink(section.id, e)}
                        className="p-1.5 text-text-tertiary hover:text-text rounded hover:bg-surface-muted"
                        title="Copy anchor link"
                      >
                        {copiedId === section.id ? (
                          <Check className="w-3.5 h-3.5 text-[#15803D]" strokeWidth={2} />
                        ) : (
                          <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                        )}
                      </button>
                      <ChevronDown
                        className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs text-text-secondary leading-relaxed border-t border-border/50 bg-surface-muted/20 animate-fadeIn">
                      <p className="whitespace-pre-line">{section.content}</p>
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-tertiary">
                        <span>Governing edition: {section.version}</span>
                        <span>Audited by Legal & People Ops</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
