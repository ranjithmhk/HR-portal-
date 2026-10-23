import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Clock,
  Pin,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Cpu,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';
import { RailLayout } from '../../components/ui/RailLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FeedPost } from '../../types';

export const AdminOverview: React.FC = () => {
  const {
    users,
    feedPosts,
    createPost,
    deletePost,
    candidates,
    issueReports,
    tasks,
  } = useStore();

  const navigate = useNavigate();

  // CT Texas Live Clock
  const [ctTime, setCtTime] = useState('');
  const [ctDate, setCtDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCtTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/Chicago',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCtDate(
        now.toLocaleDateString('en-US', {
          timeZone: 'America/Chicago',
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Post Announcement Composer
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postCategory, setPostCategory] = useState<FeedPost['category']>('Announcement');
  const [pinToTop, setPinToTop] = useState(true);
  const [success, setSuccess] = useState(false);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    createPost({
      title: postTitle,
      body: postBody,
      category: postCategory,
      isPinned: pinToTop,
    });

    setSuccess(true);
    setPostTitle('');
    setPostBody('');
    setTimeout(() => setSuccess(false), 3000);
  };

  const hrManagersCount = users.filter(u => u.role === 'HR').length;
  const employeesCount = users.filter(u => u.role === 'EMPLOYEE').length;

  const statItems: StatItem[] = [
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Active Users',
      value: users.length,
      delta: { text: '100% Verified SSO', positive: true },
      onClick: () => navigate('/admin/people/employees'),
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Active Employees',
      value: employeesCount,
      delta: { text: '+4 Q4 target', neutral: true },
      onClick: () => navigate('/admin/people/employees'),
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: 'HR Managers',
      value: hrManagersCount,
      delta: { text: 'Dallas & Remote', neutral: true },
      hasGradientAccent: true,
      onClick: () => navigate('/admin/people/employees'),
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Pending Approval',
      value: '2 Offers',
      delta: { text: 'Awaiting Executive Sign-off', danger: true },
      onClick: () => navigate('/admin/operations/offer-letters'),
    },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/overview' }, { label: 'System Health' }]}
        title="Executive Admin Console & Health Overview"
        subtitle="System health and recent activity at a glance · RBAC security, executive announcements, and telemetry"
      />

      {/* Stat Strip */}
      <StatStrip stats={statItems} />

      {/* 2-Column Command Center Layout */}
      <RailLayout
        rail={
          <>
            {/* Large Live Clock Card "CT — Texas" */}
            <Card variant="ink" className="p-6 text-center space-y-3 shadow-sm border border-border">
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest block">
                Primary Corporate Headquarters
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-text">CT — Texas</h2>
              <div className="py-2">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-text font-mono tracking-tight block">
                  {ctTime || '01:08:29 PM'}
                </span>
                <span className="text-xs text-text-secondary mt-1 block">{ctDate || 'Thursday, October 22, 2026'}</span>
              </div>
              <div className="pt-2 border-t border-border text-[11px] text-text-tertiary">
                Central Standard Time (CST) · Dallas HQ
              </div>
            </Card>

            {/* Actions Needed Card */}
            <Card className="space-y-3">
              <span className="micro-label text-text-secondary">Executive Actions Needed</span>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => navigate('/admin/operations/offer-letters')}
                  className="p-3 rounded-lg bg-surface-muted hover:bg-primary-50/50 cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-text">Offer letter: Emily Watson ($165k)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-spark-50 text-spark">
                    Sign-off
                  </span>
                </div>
                <div
                  onClick={() => navigate('/admin/people/handbooks')}
                  className="p-3 rounded-lg bg-surface-muted hover:bg-primary-50/50 cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-text">Handbook v5 draft update pending</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary">
                    Review
                  </span>
                </div>
              </div>
            </Card>
          </>
        }
      >
        {/* Main Column (8/12) */}

        {/* 1. Post Announcement Composer */}
        <Card className="space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 className="font-heading font-bold text-base text-text">
                Post Executive Announcement
              </h3>
              <p className="text-xs text-text-secondary">
                Broadcast an official notice directly to all company employees
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded bg-primary-50">
              Company-Wide
            </span>
          </div>

          {success && (
            <div className="p-3 rounded-lg bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" /> Announcement published and pinned!
            </div>
          )}

          <form onSubmit={handlePost} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Announcement title / headline..."
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <textarea
              rows={3}
              required
              placeholder="Official message to team..."
              value={postBody}
              onChange={e => setPostBody(e.target.value)}
              className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <select
                  value={postCategory}
                  onChange={e => setPostCategory(e.target.value as any)}
                  className="h-8 px-2.5 rounded-lg border border-border bg-surface text-xs text-text font-semibold"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Policy">Policy Directive</option>
                  <option value="General">General</option>
                </select>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-text">
                  <input
                    type="checkbox"
                    checked={pinToTop}
                    onChange={e => setPinToTop(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                  />
                  <span>Pin to top</span>
                </label>
              </div>

              <button
                type="submit"
                className="h-8 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
              >
                Post Announcement →
              </button>
            </div>
          </form>
        </Card>

        {/* 2. Charts Row: Active User Composition & Onboarding Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active User Composition Donut Simulator */}
          <Card className="p-5 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-text-secondary">
              Active User Composition
            </h4>
            <div className="flex items-center justify-center p-4">
              <div className="relative w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center text-center shadow-inner">
                <div>
                  <span className="font-heading font-extrabold text-2xl text-text block leading-none">
                    {users.length}
                  </span>
                  <span className="text-[10px] text-text-tertiary uppercase tracking-wider block mt-0.5">
                    Total Users
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-around text-xs pt-1 border-t border-border">
              <span className="flex items-center gap-1.5 font-semibold text-text">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Engineering (60%)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-text">
                <span className="w-2.5 h-2.5 rounded-full bg-magenta" /> HR & Ops (40%)
              </span>
            </div>
          </Card>

          {/* Onboarding Pipeline Card */}
          <Card className="p-5 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-text-secondary">
              Onboarding Pipeline Throughput
            </h4>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-text mb-1">
                  <span>Offer Stage (2 hires)</span>
                  <span>50%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-text mb-1">
                  <span>I-9 & Background (1 hire)</span>
                  <span>25%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div className="h-full bg-magenta rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-text mb-1">
                  <span>Fully Cleared & Provisioned (1 hire)</span>
                  <span>25%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div className="h-full bg-[#15803D] rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Recent Announcements */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-border">
            <h3 className="font-heading font-bold text-sm text-text">Recent Executive Broadcasts</h3>
            <span className="text-xs text-text-tertiary">Feed history</span>
          </div>

          <div className="space-y-2.5">
            {feedPosts.slice(0, 3).map(p => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl border border-border bg-surface flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">{p.title}</span>
                    {p.isPinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-spark-50 text-spark">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">{p.body}</p>
                </div>

                <button
                  onClick={() => deletePost(p.id)}
                  className="p-1 text-text-tertiary hover:text-[#C81E3A]"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </RailLayout>
    </div>
  );
};
