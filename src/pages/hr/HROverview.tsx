import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  UserPlus,
  Send,
  ArrowRight,
  Pin,
  Bell,
  Sparkles,
  DollarSign,
  ChevronRight,
  Building,
  Cake,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Card } from '../../components/ui/Card';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';
import { RailLayout } from '../../components/ui/RailLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FeedPost } from '../../types';

export const HROverview: React.FC = () => {
  const {
    currentUser,
    users,
    leaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    candidates,
    activityReports,
    tasks,
    createPost,
    supportRequests,
    expenses,
    issueReports,
    documents,
  } = useStore();

  const navigate = useNavigate();

  // Leaves tab state
  const [leaveTab, setLeaveTab] = useState<'all' | 'half'>('all');

  // Announcement composer
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annCategory, setAnnCategory] = useState<FeedPost['category']>('Announcement');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Incomplete emergency contacts
  const incompleteContacts = users.filter(u => !u.emergencyContactsComplete);
  const [remindedMap, setRemindedMap] = useState<{ [id: string]: boolean }>({});
  const [allReminded, setAllReminded] = useState(false);

  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const filteredPendingLeaves =
    leaveTab === 'all' ? pendingLeaves : pendingLeaves.filter(r => r.isHalfDay);

  const pendingDocuments = documents.filter(d => d.status === 'Pending review');
  const pendingRequests = supportRequests.filter(r => r.status !== 'Resolved');
  const pendingExpenses = expenses.filter(e => e.status === 'Submitted');
  const openWhistleblowers = issueReports.filter(i => i.status !== 'Resolved');
  const overdueTasks = tasks.filter(t => t.isOverdue);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;

    createPost({
      title: annTitle,
      body: annBody,
      category: annCategory,
      isPinned: true,
    });
    setAnnSuccess(true);
    setAnnTitle('');
    setAnnBody('');
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const handleRemind = (userId: string) => {
    setRemindedMap(prev => ({ ...prev, [userId]: true }));
  };

  const handleRemindAll = () => {
    setAllReminded(true);
  };

  // Stat Strip Items as per spec
  const statItems: StatItem[] = [
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Total Workforce',
      value: users.length,
      delta: { text: '+2 this month', positive: true },
      onClick: () => navigate('/hr/people/employees'),
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Pending Approvals',
      value: pendingLeaves.length + pendingExpenses.length,
      delta: { text: `${pendingLeaves.length} leaves · ${pendingExpenses.length} claims`, neutral: true },
      hasGradientAccent: true, // Gradient accent on ONE cell only
      onClick: () => navigate('/hr/time-pay/leave-approvals'),
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Out Today',
      value: '1 On Leave',
      delta: { text: 'Sara Jenkins (SL)', neutral: true },
      onClick: () => navigate('/hr/people/holiday-calendar'),
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'At Risk',
      value: `${overdueTasks.length} Overdue`,
      delta: {
        text: `${overdueTasks.length} tasks overdue · ${openWhistleblowers.length} report open`,
        danger: true,
      },
      onClick: () => navigate('/hr/risk/compliance'),
    },
  ];

  // Swimlane pipeline
  const pipeline = [
    { label: 'Offer Pending', count: candidates.filter(c => c.status === 'Pending Offer').length, stage: 'Pending Offer' },
    { label: 'Awaiting Sign-off', count: candidates.filter(c => c.offerLetterStatus === 'Pending Admin').length, stage: 'Review' },
    { label: 'Admin Review', count: 1, stage: 'Admin' },
    { label: 'Onboarding', count: candidates.filter(c => c.status === 'In Progress').length, stage: 'Onboarding' },
  ];

  return (
    <div className="space-y-6 page-transition">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text font-heading tracking-tight leading-tight">
            Good afternoon, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            People Operations · Workforce overview & approvals
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/hr/recruit/candidates')}
            className="h-9 px-4 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
          >
            + Onboard Candidate
          </motion.button>
        </div>
      </div>

      {/* Horizontal Stat Strip */}
      <StatStrip stats={statItems} />

      {/* Command Center Layout: Main (8/12) + Right Rail (4/12) */}
      <RailLayout
        rail={
          <>
            {/* "Needs your action" List with Orange Count Pills */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="micro-label text-text-secondary">Needs Your Action</span>
                <span className="text-[10px] uppercase font-bold text-spark tracking-wider">
                  Urgent Priority
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Documents to review & verify', count: pendingDocuments.length, href: '/hr/work/documents' },
                  { label: 'Employee requests open', count: pendingRequests.length, href: '/hr/work/requests' },
                  { label: 'Timesheets awaiting approval', count: 1, href: '/hr/time-pay/timesheets' },
                  { label: 'Expense claims pending', count: pendingExpenses.length, href: '/hr/time-pay/expenses' },
                  { label: 'Whistleblower reports open', count: openWhistleblowers.length, href: '/hr/risk/whistle-blower' },
                  { label: 'Payroll drafts to finalise', count: 1, href: '/hr/time-pay/payroll' },
                  { label: 'Candidates onboarding', count: candidates.filter(c => c.status === 'In Progress').length, href: '/hr/recruit/candidates' },
                ].map(item => (
                  <motion.div
                    key={item.label}
                    whileHover={{ x: 3, backgroundColor: 'rgba(5, 108, 184, 0.05)' }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => navigate(item.href)}
                    className="p-2.5 rounded-lg bg-surface-muted cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <span className="text-text group-hover:text-primary font-medium">{item.label}</span>
                    <span className="w-5 h-5 rounded-full bg-spark text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {item.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Post Announcement Composer */}
            <Card className="space-y-3">
              <span className="micro-label text-text-secondary">Broadcast Announcement</span>

              {annSuccess ? (
                <div className="p-3 rounded-lg bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Posted and pinned to feed!
                </div>
              ) : (
                <form onSubmit={handlePostAnnouncement} className="space-y-3">
                  <input
                    type="text"
                    name="announcement-title"
                    autoComplete="off"
                    required
                    placeholder="Announcement title…"
                    aria-label="Announcement title"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-input border border-border bg-surface text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <textarea
                    rows={2}
                    name="announcement-body"
                    required
                    placeholder="Broadcast text…"
                    aria-label="Announcement text"
                    value={annBody}
                    onChange={e => setAnnBody(e.target.value)}
                    className="w-full p-2.5 rounded-input border border-border bg-surface text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      name="announcement-category"
                      aria-label="Announcement category"
                      value={annCategory}
                      onChange={e => setAnnCategory(e.target.value as any)}
                      className="h-8 px-2 rounded-lg border border-border bg-surface text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Policy">Policy</option>
                      <option value="General">General</option>
                    </select>
                    <button
                      type="submit"
                      className="h-8 px-3.5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Post →
                    </button>
                  </div>
                </form>
              )}
            </Card>

            {/* Incomplete Emergency Contacts */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="micro-label text-text-secondary">Incomplete Contacts</span>
                {allReminded ? (
                  <span className="text-[11px] font-semibold text-emerald-700">All Reminded ✓</span>
                ) : (
                  <button
                    onClick={handleRemindAll}
                    className="text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                  >
                    Remind All
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {incompleteContacts.map(u => (
                  <div key={u.id} className="p-2.5 rounded-lg bg-surface-muted flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-text">{u.name}</p>
                      <p className="text-[10px] text-text-tertiary">#{u.id} · {u.department}</p>
                    </div>

                    {remindedMap[u.id] || allReminded ? (
                      <span className="text-[10px] font-semibold text-emerald-700">Sent</span>
                    ) : (
                      <button
                        onClick={() => handleRemind(u.id)}
                        className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                      >
                        Remind
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Birthdays with Days Until */}
            <Card className="space-y-3">
              <span className="micro-label text-text-secondary">Birthdays · Next 14 Days</span>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-muted flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-magenta-50 text-magenta flex items-center justify-center shrink-0">
                      <Cake className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-text">Priya Patel</p>
                      <p className="text-[10px] text-text-tertiary">Data Science · Hyderabad</p>
                    </div>
                  </div>
                  <span className="font-bold text-magenta text-[11px]">in 6 days</span>
                </div>
              </div>
            </Card>
          </>
        }
      >
        {/* Main Column (8/12) */}

        {/* 1. Leave Approvals Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-text font-heading">Leave Approvals Queue</h2>
              <p className="text-xs text-text-secondary">Review pending team leave requests</p>
            </div>

            {/* Tabs: Leaves / Half Day */}
            <div className="flex items-center p-1 rounded-lg bg-surface-muted border border-border text-xs">
              <button
                onClick={() => setLeaveTab('all')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  leaveTab === 'all' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
                }`}
              >
                All Leaves ({pendingLeaves.length})
              </button>
              <button
                onClick={() => setLeaveTab('half')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  leaveTab === 'half' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
                }`}
              >
                Half-Day ({pendingLeaves.filter(r => r.isHalfDay).length})
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border shadow-sm">
            {filteredPendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#15803D] font-semibold">
                ✓ All caught up! No pending leave requests to approve.
              </div>
            ) : (
              filteredPendingLeaves.map(req => (
                <div
                  key={req.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-primary-50/20 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text">{req.employeeName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-muted text-text-secondary">
                        {req.department}
                      </span>
                      <span className="text-xs font-bold text-primary font-mono">{req.type}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {req.fromDate} to {req.toDate} ({req.days} days) · Reason: "{req.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveLeaveRequest(req.id, 'Approved by People Ops')}
                      className="h-8 px-3 rounded-btn bg-[#15803D] hover:bg-[#126b33] text-white text-xs font-semibold shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectLeaveRequest(req.id, 'Insufficient leave accrual')}
                      className="h-8 px-3 rounded-btn border border-[#C81E3A] text-[#C81E3A] hover:bg-[#FDECEF] text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Recruitment Pipeline Horizontal Swimlane */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text font-heading">Recruitment & Candidate Pipeline</h2>
              <p className="text-xs text-text-secondary">Active candidate progress across stages</p>
            </div>
            <button
              onClick={() => navigate('/hr/recruit/candidates')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Manage Candidates →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pipeline.map(lane => (
              <motion.div
                key={lane.label}
                whileHover={{ y: -3, scale: 1.02, borderColor: 'var(--primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={() => navigate('/hr/recruit/candidates')}
                className="p-4 rounded-xl bg-surface border border-border cursor-pointer transition-colors shadow-sm"
              >
                <span className="micro-label text-text-secondary block">{lane.label}</span>
                <p className="font-heading font-extrabold text-2xl text-text mt-1">{lane.count}</p>
                <p className="text-[10px] text-text-tertiary mt-1">Candidates in stage</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Recent Activity Reports from Engineering Team */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text font-heading">Recent Activity Reports</h2>
              <p className="text-xs text-text-secondary">Weekly and daily work reports submitted by engineering leads</p>
            </div>
            <button
              onClick={() => navigate('/hr/work/activity-reports')}
              className="text-xs font-bold text-primary hover:underline"
            >
              View all reports →
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface divide-y divide-border shadow-sm">
            {activityReports.slice(0, 3).map(rep => (
              <div key={rep.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">{rep.submittedBy}</span>
                    <span className="text-[10px] font-mono text-text-tertiary">{rep.period}</span>
                  </div>
                  <p className="text-text-secondary mt-0.5 line-clamp-1">{rep.accomplishments}</p>
                </div>
                <StatusBadge variant="success" size="sm">
                  SUBMITTED
                </StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </RailLayout>
    </div>
  );
};
