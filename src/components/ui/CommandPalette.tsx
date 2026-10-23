import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  Compass,
  Zap,
  ArrowRight,
  Clock,
  Calendar,
  FileText,
  DollarSign,
  Shield,
  Briefcase,
  Users,
  Settings,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    users,
    clockIn,
    clockOut,
    isClockedIn,
    toggleAiAssistant,
    isDarkMode,
    toggleDarkMode,
  } = useStore();

  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  const allItems = [
    // Quick Actions
    {
      id: 'act-clock',
      title: isClockedIn ? 'Clock Out (Punch Out)' : 'Clock In (Punch In)',
      category: 'Actions',
      icon: <Clock className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => (isClockedIn ? clockOut() : clockIn()),
    },
    {
      id: 'act-ai',
      title: 'Open AI Assistant Copilot',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
      action: () => toggleAiAssistant(),
    },
    {
      id: 'act-theme',
      title: isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      category: 'Actions',
      icon: isDarkMode ? <Sun className="w-4 h-4 text-spark" strokeWidth={1.75} /> : <Moon className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => toggleDarkMode(),
    },

    // Employee Destinations
    {
      id: 'nav-emp-home',
      title: 'Employee Home Dashboard',
      subtitle: 'Overview, tasks, today at a glance',
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/employee/home'),
    },
    {
      id: 'nav-emp-leaves',
      title: 'Leaves & Time Off',
      subtitle: 'Apply CL/SL, balance meters, leave history',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/employee/time/leaves'),
    },
    {
      id: 'nav-emp-att',
      title: 'Attendance & Punch Log',
      subtitle: 'Daily punch, correction requests, calendar heatmap',
      category: 'Navigation',
      icon: <Clock className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/employee/time/attendance'),
    },
    {
      id: 'nav-emp-reports',
      title: 'Activity Reports (AI-Powered)',
      subtitle: 'Voice dictation & structured work reports',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/employee/work/activity-reports'),
    },
    {
      id: 'nav-emp-exp',
      title: 'Expenses & Reimbursements',
      subtitle: 'Submit claims with receipt scanning',
      category: 'Navigation',
      icon: <DollarSign className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/employee/finance/expenses'),
    },
    {
      id: 'nav-emp-handbook',
      title: 'Employee Handbook v4',
      subtitle: 'Company policies and acknowledgements',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/employee/company/handbook'),
    },
    {
      id: 'nav-emp-issue',
      title: 'Report an Issue (Whistleblower)',
      subtitle: 'Confidential reporting with tracking token',
      category: 'Navigation',
      icon: <Shield className="w-4 h-4 text-danger" strokeWidth={1.75} />,
      action: () => navigate('/employee/me/report-issue'),
    },

    // HR Console Destinations
    {
      id: 'nav-hr-overview',
      title: 'HR Console Overview',
      subtitle: 'Approvals queue, recruitment pipeline, at-risk tasks',
      category: 'HR Console',
      icon: <Briefcase className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/hr/overview'),
    },
    {
      id: 'nav-hr-cand',
      title: 'Candidate Onboarding & I-9 Verification',
      subtitle: 'Track new hires, documents, I-9 section 2',
      category: 'HR Console',
      icon: <Users className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/hr/recruit/candidates'),
    },
    {
      id: 'nav-hr-comp',
      title: 'Compliance & H1B Wage Monitor',
      subtitle: 'Work authorization, LCA prevailing wages',
      category: 'HR Console',
      icon: <Shield className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/hr/risk/compliance'),
    },
    {
      id: 'nav-hr-ar',
      title: 'Accounts Receivable Invoices',
      subtitle: 'Customer billing, collections, aging',
      category: 'HR Console',
      icon: <DollarSign className="w-4 h-4 text-primary" strokeWidth={1.75} />,
      action: () => navigate('/hr/accounting/receivable'),
    },

    // Admin Console Destinations
    {
      id: 'nav-adm-overview',
      title: 'Admin Console Overview',
      subtitle: 'System health, CT live clock card, user metrics',
      category: 'Admin Console',
      icon: <Settings className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
      action: () => navigate('/admin/overview'),
    },
    {
      id: 'nav-adm-handbook',
      title: 'Admin Handbook Editor',
      subtitle: 'Manage draft sections and publish new version',
      category: 'Admin Console',
      icon: <FileText className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
      action: () => navigate('/admin/people/handbooks'),
    },
    {
      id: 'nav-adm-signers',
      title: 'Authorized Signers',
      subtitle: 'Manage authorized signers for vendor MSAs',
      category: 'Admin Console',
      icon: <Shield className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
      action: () => navigate('/admin/accounting/signers'),
    },

    // People
    ...users.map(u => ({
      id: `usr-${u.id}`,
      title: `${u.name} · #${u.id}`,
      subtitle: `${u.jobTitle} (${u.department}) · ${u.workLocation}`,
      category: 'People',
      icon: <User className="w-4 h-4 text-text-secondary" strokeWidth={1.75} />,
      action: () => navigate(`/employee/company/directory?selected=${u.id}`),
    })),
  ];

  const filteredItems = allItems.filter(item => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-surface">
              <Search className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search people, pages, policies, or actions... (Esc to close)"
                className="flex-1 bg-transparent text-sm text-text placeholder:text-text-tertiary focus:outline-none"
              />
              <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-surface-muted border border-border text-text-tertiary">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border/40">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-secondary">
                  No matching results found for "{search}".
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => {
                        item.action();
                        setCommandPaletteOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-50/40 text-primary' : 'hover:bg-surface-muted/70 text-text'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary text-white shadow-sm' : 'bg-surface-muted text-text-secondary'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${isSelected ? 'text-primary' : 'text-text'}`}>
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-[11px] text-text-tertiary truncate">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface-muted text-text-tertiary">
                          {item.category}
                        </span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-surface-muted/50 border-t border-border flex items-center justify-between text-[11px] text-text-tertiary">
              <span>Navigate with ↑ and ↓</span>
              <span>Select with ↵ Enter</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
