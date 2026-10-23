import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Home,
  Building2,
  Users,
  BookOpen,
  Clock,
  Calendar,
  FileSpreadsheet,
  CheckSquare,
  Mic,
  Star,
  Award,
  Receipt,
  FileText,
  LifeBuoy,
  UserCheck,
  ShieldAlert,
  UserPlus,
  Send,
  CalendarCheck,
  CreditCard,
  DollarSign,
  AlertTriangle,
  FolderOpen,
  PieChart,
  ArrowRightLeft,
  Truck,
  Sliders,
  ShieldCheck,
  Shield,
  Cpu,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MegaMenuItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  href?: string;
  items?: MegaMenuItem[];
}

export const NavBar: React.FC = () => {
  const { currentRole } = useStore();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Define nav structures per role
  const employeeGroups: NavGroup[] = [
    {
      label: 'Home',
      href: '/employee/home',
    },
    {
      label: 'Company',
      items: [
        {
          title: 'Company Feed',
          description: 'Announcements, town halls and peer posts',
          href: '/employee/company/feed',
          icon: <Building2 className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Directory',
          description: 'Colleague directory and interactive org chart',
          href: '/employee/company/directory',
          icon: <Users className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Handbook',
          description: 'Company guidelines and compliance policies',
          href: '/employee/company/handbook',
          icon: <BookOpen className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Time',
      items: [
        {
          title: 'Attendance',
          description: 'Daily punches, correction requests & calendar log',
          href: '/employee/time/attendance',
          icon: <Clock className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Leaves',
          description: 'CL/SL balances, half-day leaves and requests',
          href: '/employee/time/leaves',
          icon: <Calendar className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Timesheets',
          description: 'Log and submit confirmed client working hours',
          href: '/employee/time/timesheets',
          icon: <FileSpreadsheet className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Work',
      items: [
        {
          title: 'Tasks',
          description: 'Sprint action items, board & verification',
          href: '/employee/work/tasks',
          icon: <CheckSquare className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Activity Reports',
          description: 'Voice-powered AI daily & weekly work summaries',
          href: '/employee/work/activity-reports',
          icon: <Mic className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Reviews',
          description: 'Quarterly self-evaluation and appraisal history',
          href: '/employee/work/reviews',
          icon: <Star className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Team Reviews',
          description: 'Manager ratings and feedback for direct reports',
          href: '/employee/work/team-reviews',
          icon: <Award className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Finance & Docs',
      items: [
        {
          title: 'Expenses',
          description: 'Submit claims with auto-detected bill receipt scan',
          href: '/employee/finance/expenses',
          icon: <Receipt className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Documents',
          description: 'Official employment docs, CY payslips & uploads',
          href: '/employee/finance/documents',
          icon: <FileText className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'My Requests',
          description: 'HR support tickets, SLA tracking & chat replies',
          href: '/employee/finance/my-requests',
          icon: <LifeBuoy className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Me',
      items: [
        {
          title: 'My Profile',
          description: 'Personal, emergency contacts and bank details',
          href: '/employee/me/profile',
          icon: <UserCheck className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Onboarding',
          description: 'New hire onboarding checklist, e-sign & I-9',
          href: '/employee/me/onboarding',
          icon: <UserPlus className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Report an Issue',
          description: 'Confidential whistleblower portal with token status',
          href: '/employee/me/report-issue',
          icon: <ShieldAlert className="w-4 h-4 text-spark" strokeWidth={1.75} />,
        },
      ],
    },
  ];

  const hrGroups: NavGroup[] = [
    {
      label: 'Overview',
      href: '/hr/overview',
    },
    {
      label: 'Recruit',
      items: [
        {
          title: 'Candidates',
          description: 'New hire pipeline, onboarding tasks & I-9 section 2',
          href: '/hr/recruit/candidates',
          icon: <UserPlus className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Offer Letters',
          description: 'Generate, preview and track candidate offer letters',
          href: '/hr/recruit/offer-letters',
          icon: <Send className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'People',
      items: [
        {
          title: 'Employees',
          description: 'Full workforce directory, roles, and status',
          href: '/hr/people/employees',
          icon: <Users className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Performance',
          description: 'Quarterly review cycles, ratings and evaluations',
          href: '/hr/people/performance',
          icon: <Star className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Feedback',
          description: 'Employee sentiment, ratings and anonymous inputs',
          href: '/hr/people/feedback',
          icon: <Award className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Announcements',
          description: 'Publish and pin company-wide broadcasts',
          href: '/hr/people/announcements',
          icon: <Building2 className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Holiday Calendar',
          description: 'US & India public and company holidays',
          href: '/hr/people/holiday-calendar',
          icon: <CalendarCheck className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Time & Pay',
      items: [
        {
          title: 'Leave Approvals',
          description: 'Review and approve pending employee leaves',
          href: '/hr/time-pay/leave-approvals',
          icon: <Calendar className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Timesheets',
          description: 'Approve submitted client billable hours',
          href: '/hr/time-pay/timesheets',
          icon: <FileSpreadsheet className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Payroll',
          description: 'Monthly payroll runs, tax deductions & payslips',
          href: '/hr/time-pay/payroll',
          icon: <CreditCard className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Expenses',
          description: 'Review and verify employee reimbursement claims',
          href: '/hr/time-pay/expenses',
          icon: <Receipt className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Work',
      items: [
        {
          title: 'Tasks',
          description: 'Company-wide task progress & overdue tracking',
          href: '/hr/work/tasks',
          icon: <CheckSquare className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'My Tasks',
          description: 'Personal HR priorities and action items',
          href: '/hr/work/my-tasks',
          icon: <CheckSquare className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Activity Reports',
          description: 'Review submitted daily and weekly reports',
          href: '/hr/work/activity-reports',
          icon: <Mic className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Documents',
          description: 'Verification queue for employee submitted files',
          href: '/hr/work/documents',
          icon: <FolderOpen className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Requests',
          description: 'Incoming employee help desk and visa support inbox',
          href: '/hr/work/requests',
          icon: <LifeBuoy className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Risk',
      items: [
        {
          title: 'Whistle Blower',
          description: 'Confidential case management & resolution tracking',
          href: '/hr/risk/whistle-blower',
          icon: <ShieldAlert className="w-4 h-4 text-spark" strokeWidth={1.75} />,
        },
        {
          title: 'Compliance',
          description: 'Work authorization, I-9 and H1B wage monitoring',
          href: '/hr/risk/compliance',
          icon: <AlertTriangle className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Audit Log',
          description: 'System actions, permissions and access events',
          href: '/hr/risk/audit-log',
          icon: <ShieldCheck className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Accounting',
      items: [
        {
          title: 'Accounts Receivable',
          description: 'Client invoices, payment tracking and overdue aging',
          href: '/hr/accounting/receivable',
          icon: <DollarSign className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Accounts Payable',
          description: 'Vendor bills, approval queue and payment status',
          href: '/hr/accounting/payable',
          icon: <CreditCard className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Accounting Reports',
          description: 'P&L, cash flow and financial health charts',
          href: '/hr/accounting/reports',
          icon: <PieChart className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Reconciliation',
          description: 'Two-pane ledger vs bank statement matching',
          href: '/hr/accounting/reconciliation',
          icon: <ArrowRightLeft className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
        {
          title: 'Vendors',
          description: 'Vendor directory, terms, and billing summaries',
          href: '/hr/accounting/vendors',
          icon: <Truck className="w-4 h-4 text-primary-300" strokeWidth={1.75} />,
        },
      ],
    },
  ];

  const adminGroups: NavGroup[] = [
    {
      label: 'Overview',
      href: '/admin/overview',
    },
    {
      label: 'People',
      items: [
        {
          title: 'Employees',
          description: 'Workforce records and role provisioning',
          href: '/admin/people/employees',
          icon: <Users className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Announcements',
          description: 'Company broadcasts and executive memos',
          href: '/admin/people/announcements',
          icon: <Building2 className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Feedback',
          description: 'Workforce engagement and pulse analysis',
          href: '/admin/people/feedback',
          icon: <Award className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Whistle Blower',
          description: 'Ethics investigations and governance review',
          href: '/admin/people/whistle-blower',
          icon: <ShieldAlert className="w-4 h-4 text-spark" strokeWidth={1.75} />,
        },
        {
          title: 'Handbooks',
          description: 'Publish draft sections and update compliance edition',
          href: '/admin/people/handbooks',
          icon: <BookOpen className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Operations',
      items: [
        {
          title: 'Offer Letters',
          description: 'Executive sign-off on hiring proposals',
          href: '/admin/operations/offer-letters',
          icon: <Send className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Onboarding',
          description: 'Departmental onboarding throughput & stuck hires',
          href: '/admin/operations/onboarding',
          icon: <UserPlus className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Leaves',
          description: 'Executive leave calendar and department coverage',
          href: '/admin/operations/leaves',
          icon: <Calendar className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Expenses',
          description: 'High-value claims and audit review',
          href: '/admin/operations/expenses',
          icon: <Receipt className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'HR Requests',
          description: 'Escalated legal and HR tickets',
          href: '/admin/operations/hr-requests',
          icon: <LifeBuoy className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Tasks',
          description: 'System-wide priority tracking and SLAs',
          href: '/admin/operations/tasks',
          icon: <CheckSquare className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Payroll',
          description: 'Finalize monthly payroll disbursements',
          href: '/admin/operations/payroll',
          icon: <CreditCard className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Clients',
          description: 'Enterprise client agreements and account managers',
          href: '/admin/operations/clients',
          icon: <Building2 className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'System',
      items: [
        {
          title: 'Roles & Matrix',
          description: 'RBAC permissions and role assignments',
          href: '/admin/system/roles',
          icon: <Lock className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Audit Log',
          description: 'Immutable system audit trail and SOC2 evidence',
          href: '/admin/system/audit-log',
          icon: <ShieldCheck className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Compliance',
          description: 'Legal authorization and statutory compliance',
          href: '/admin/system/compliance',
          icon: <AlertTriangle className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'API Usage',
          description: 'System telemetry, costs, calls & error rates',
          href: '/admin/system/api-usage',
          icon: <Cpu className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
      ],
    },
    {
      label: 'Accounting',
      items: [
        {
          title: 'Accounts Receivable',
          description: 'Invoicing and revenue collection ledger',
          href: '/admin/accounting/receivable',
          icon: <DollarSign className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Accounts Payable',
          description: 'Corporate vendor payables and authorizations',
          href: '/admin/accounting/payable',
          icon: <CreditCard className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Accounting Reports',
          description: 'Financial balance sheet and P&L summaries',
          href: '/admin/accounting/reports',
          icon: <PieChart className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Reconciliation',
          description: 'Bank matching and ledger verification',
          href: '/admin/accounting/reconciliation',
          icon: <ArrowRightLeft className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Vendors',
          description: 'Vendor partners and master agreements',
          href: '/admin/accounting/vendors',
          icon: <Truck className="w-4 h-4 text-magenta" strokeWidth={1.75} />,
        },
        {
          title: 'Authorized Signers',
          description: 'Manage users authorized to sign vendor MSAs',
          href: '/admin/accounting/signers',
          icon: <Shield className="w-4 h-4 text-spark" strokeWidth={1.75} />,
        },
      ],
    },
  ];

  const currentGroups =
    currentRole === 'EMPLOYEE'
      ? employeeGroups
      : currentRole === 'HR'
      ? hrGroups
      : adminGroups;

  // Active expanded mega group
  const activeGroup = currentGroups.find(g => g.label === activeMenu && g.items);

  return (
    <nav
      ref={navRef}
      className="h-12 w-full bg-white text-text px-4 lg:px-8 border-b border-border relative z-30 select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-sans"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Navigation Groups List */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar h-full">
          {currentGroups.map(group => {
            const isSingle = !!group.href;
            const isGroupActive = isSingle
              ? location.pathname === group.href
              : group.items?.some(item => location.pathname === item.href);

            const isMenuOpen = activeMenu === group.label;

            if (isSingle) {
              return (
                <NavLink
                  key={group.label}
                  to={group.href!}
                  className={({ isActive }) =>
                    `h-full px-3.5 flex items-center text-[13px] font-medium relative transition-colors ${
                      isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-primary'
                    }`
                  }
                >
                  <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                    {group.label}
                  </motion.span>
                  {isGroupActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            }

            return (
              <div key={group.label} className="h-full flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveMenu(isMenuOpen ? null : group.label)}
                  className={`h-full px-3.5 flex items-center gap-1.5 text-[13px] font-medium relative transition-colors ${
                    isGroupActive || isMenuOpen ? 'text-primary font-semibold' : 'text-text-secondary hover:text-primary'
                  }`}
                  aria-expanded={isMenuOpen}
                >
                  <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-1.5">
                    <span>{group.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isMenuOpen ? 'rotate-180 text-primary' : 'text-text-tertiary'
                      }`}
                      strokeWidth={1.75}
                    />
                  </motion.span>
                  {(isGroupActive || isMenuOpen) && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Current Role Indicator on right edge */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse" />
          <span>Live Workspace: <strong className="text-text font-semibold">{currentRole}</strong></span>
        </div>
      </div>

      {/* Full-Window Expanded Mega Menu Panel with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {activeGroup && activeGroup.items && (
          <React.Fragment key={activeGroup.label}>
            {/* Backdrop Scrim across the page */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[115px] bg-black/35 backdrop-blur-[2px] z-40"
              onClick={() => setActiveMenu(null)}
              aria-hidden="true"
            />

            {/* Expanded Mega Navigation Window */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ backgroundColor: '#FFFFFF' }}
              className="absolute top-full left-0 right-0 w-full bg-white border-b border-border shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 text-text"
            >
              <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                {/* Category Header Strip */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary bg-primary-50 px-3 py-1 rounded-full border border-primary-100 shadow-xs">
                      {activeGroup.label}
                    </span>
                    <span className="text-xs text-text-secondary font-medium">
                      Explore all {activeGroup.items.length} sections and workflows
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveMenu(null)}
                    className="text-xs text-text-secondary hover:text-text px-3 py-1 rounded-md hover:bg-surface-muted transition-colors flex items-center gap-1.5 border border-border shadow-xs"
                  >
                    <span>Close</span>
                    <kbd className="font-mono text-[10px] bg-surface-muted px-1.5 py-0.5 rounded border border-border text-text-tertiary">ESC</kbd>
                  </motion.button>
                </div>

                {/* Spacious Multi-Column Grid */}
                <div
                  className={`grid gap-4 ${
                    activeGroup.items.length <= 3
                      ? 'grid-cols-1 md:grid-cols-3'
                      : activeGroup.items.length === 4
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                      : activeGroup.items.length <= 6
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                  }`}
                >
                  {activeGroup.items.map(item => {
                    const isCurrent = location.pathname === item.href;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={() => setActiveMenu(null)}
                        className="block"
                      >
                        <motion.div
                          whileHover={{ y: -3, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          transition={{ duration: 0.15 }}
                          className={`p-4 rounded-xl flex items-start gap-3.5 transition-colors group ${
                            isCurrent
                              ? 'bg-primary-50 border border-primary-300 shadow-xs'
                              : 'bg-[#F8F9FB] hover:bg-white border border-border hover:border-primary/50 shadow-xs hover:shadow-zoho'
                          }`}
                        >
                          <motion.div
                            whileHover={{ rotate: 8, scale: 1.1 }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isCurrent
                                ? 'bg-primary text-white shadow-xs'
                                : 'bg-white text-primary border border-border shadow-2xs group-hover:bg-primary group-hover:text-white group-hover:border-primary'
                            }`}
                          >
                            {item.icon}
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`font-semibold text-sm truncate ${
                                isCurrent ? 'text-primary' : 'text-text group-hover:text-primary transition-colors'
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </nav>
  );
};
