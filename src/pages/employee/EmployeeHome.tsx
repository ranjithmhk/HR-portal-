import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Check,
  TrendingUp,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Bell,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Cake,
  Star,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Card } from '../../components/ui/Card';
import { RailLayout } from '../../components/ui/RailLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StarRating } from '../../components/ui/StarRating';

export const EmployeeHome: React.FC = () => {
  const {
    currentUser,
    tasks,
    toggleTaskStatus,
    leaveBalance,
    isClockedIn,
    clockInTime,
    clockIn,
    clockOut,
    submitFeedback,
    emergencyBannerDismissed,
    dismissEmergencyBanner,
    restoreEmergencyBanner,
    holidays,
  } = useStore();

  const navigate = useNavigate();

  // Live clocks for IST and US Central
  const [istTime, setIstTime] = useState('');
  const [usCentralTime, setUsCentralTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTime(now);
      setIstTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setUsCentralTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/Chicago',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate live working duration based on clockInTime
  const workingDuration = useMemo(() => {
    if (!isClockedIn || !clockInTime) return '0h 00m';
    const match = clockInTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return '5h 42m';
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const punchDate = new Date();
    punchDate.setHours(hours, minutes, 0, 0);

    let diffMs = currentTime.getTime() - punchDate.getTime();
    if (diffMs < 0) diffMs = 0;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins.toString().padStart(2, '0')}m`;
  }, [isClockedIn, clockInTime, currentTime]);

  // Tasks segment filter & search
  const [taskFilter, setTaskFilter] = useState<'today' | 'week' | 'completed'>('today');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskSort, setTaskSort] = useState<'dueDate' | 'priority'>('dueDate');

  const userTasks = tasks.filter(t => t.assignedTo === currentUser.id);
  const pendingFocusTasksCount = userTasks
    .filter(t => t.priority === 'Urgent' || t.priority === 'High')
    .filter(t => t.status === 'Pending').length;

  const filteredTasks = useMemo(() => {
    let result = userTasks.filter(t => {
      if (taskFilter === 'completed') return t.status === 'Submitted' || t.status === 'Verified';
      if (taskFilter === 'today') return t.dueDate === '2026-10-22' || t.isOverdue;
      return true;
    });

    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (taskSort === 'priority') {
        const priorityWeight: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      return a.dueDate.localeCompare(b.dueDate);
    });

    return result;
  }, [userTasks, taskFilter, taskSearch, taskSort]);

  // Feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState<'Management' | 'General' | 'Culture' | 'Work Environment'>('General');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Wellness check-in state
  const [wellnessSelected, setWellnessSelected] = useState<string | null>(null);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    submitFeedback({
      author: isAnonymous ? 'Anonymous' : currentUser.name,
      category: feedbackCategory,
      rating: feedbackRating,
      comment: feedbackText,
    });
    setFeedbackSuccess(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  // 7-day timeline (Mon–Sun)
  const daysOfWeek = [
    { day: 'Mon', date: 'Oct 19', hours: '9.4h', status: 'present' },
    { day: 'Tue', date: 'Oct 20', hours: '9.3h', status: 'late' },
    { day: 'Wed', date: 'Oct 21', hours: '9.2h', status: 'present' },
    { day: 'Thu', date: 'Oct 22', hours: isClockedIn ? workingDuration : '5.7h', status: 'today' },
    { day: 'Fri', date: 'Oct 23', hours: '--', status: 'upcoming' },
    { day: 'Sat', date: 'Oct 24', hours: '--', status: 'weekend' },
    { day: 'Sun', date: 'Oct 25', hours: '--', status: 'weekend' },
  ];

  const clRemaining = leaveBalance.clTotal - leaveBalance.clUsed;
  const slRemaining = leaveBalance.slTotal - leaveBalance.slUsed;

  return (
    <div className="space-y-6 page-transition">
      {/* 1. EMPLOYEE OVERVIEW HEADER */}
      <div className="rounded-2xl bg-surface border border-border p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading text-text">
              Ready to start your day, {currentUser.name.split(' ')[0]}?
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
              You have{' '}
              <strong className="text-text font-semibold">
                {pendingFocusTasksCount || 1} of 2 focus tasks remaining
              </strong>{' '}
              today. Punch recorded at{' '}
              <span className="font-mono font-semibold text-text">{clockInTime || '09:18 AM'}</span>.
            </p>
          </div>

          {/* Dual Time Zone Clocks */}
          <div className="flex items-center gap-2.5 shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.15 }}
              className="p-3 rounded-xl bg-surface-muted border border-border text-center min-w-[130px] shadow-xs cursor-default"
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-tertiary block">
                US Central (Dallas)
              </span>
              <span className="font-heading font-bold text-lg text-text tabular-nums tracking-tight block my-0.5">
                {usCentralTime || '01:08:29 PM'}
              </span>
              <span className="text-[10px] text-text-tertiary block">CST · HQ Office</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.15 }}
              className="p-3 rounded-xl bg-surface-muted border border-border text-center min-w-[130px] shadow-xs cursor-default"
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-tertiary block">
                India (IST)
              </span>
              <span className="font-heading font-bold text-lg text-text tabular-nums tracking-tight block my-0.5">
                {istTime || '11:38:29 PM'}
              </span>
              <span className="text-[10px] text-text-tertiary block">IST · Delivery Center</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 2. ALERTS & NOTIFICATIONS (Dismissible Warning with Recovery) */}
      {!currentUser.emergencyContactsComplete && (
        <AnimatePresence>
          {!emergencyBannerDismissed ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              role="alert"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-amber-500 text-white">
                      Action Required
                    </span>
                    <p className="font-semibold text-text">
                      Emergency contact details incomplete
                    </p>
                  </div>
                  <p className="text-text-secondary mt-0.5">
                    Emergency contact required for health coverage.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => navigate('/employee/me/profile')}
                  className="px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Update Now →
                </button>
                <button
                  onClick={dismissEmergencyBanner}
                  className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-text rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Dismiss alert"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={restoreEmergencyBanner}
                className="text-[11px] font-medium text-text-tertiary hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <Bell className="w-3 h-3 text-[#B45309]" />
                <span>1 Dismissed Policy Warning · Show</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      )}

      {/* 3. UNIFORM 4-CARD COMMAND STRIP (Equal height, uniform styling & real actions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance */}
        <Card className="flex flex-col justify-between p-5 min-h-[185px] border border-border hover:border-primary/50 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="micro-label text-text-secondary">Attendance & Punches</span>
              <div className="w-8 h-8 rounded-full bg-primary-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isClockedIn ? 'bg-success animate-pulse' : 'bg-text-tertiary'
                  }`}
                />
                <span className="font-heading font-extrabold text-base text-text">
                  {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                </span>
              </div>
              <p className="text-xs text-text-secondary font-mono">
                {isClockedIn ? `In: ${clockInTime || '09:18 AM'} (${workingDuration})` : 'Punched out · Shift completed'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center gap-2">
            <button
              onClick={isClockedIn ? clockOut : clockIn}
              className={`flex-1 h-8 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                isClockedIn
                  ? 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20'
                  : 'hero-gradient text-white hover:opacity-95'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
            </button>
            <button
              onClick={() => navigate('/employee/time/attendance')}
              className="h-8 px-3 rounded-full border border-border hover:bg-surface-muted text-xs text-text-secondary hover:text-text transition-colors"
              title="View Attendance Log"
            >
              Log →
            </button>
          </div>
        </Card>

        {/* Card 2: Daily Activity Report */}
        <Card className="flex flex-col justify-between p-5 min-h-[185px] border border-border hover:border-spark/50 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="micro-label text-text-secondary">Daily Activity Report</span>
              <div className="w-8 h-8 rounded-full bg-spark-50 text-spark flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-heading font-extrabold text-base text-text">
                AI Draft Ready
              </span>
              <p className="text-xs text-text-secondary">
                Compiled from Jira commits & standups
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <button
              onClick={() => navigate('/employee/work/activity-reports')}
              className="w-full h-8 px-3 rounded-full border border-primary/30 bg-primary-50 hover:bg-primary-100 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-spark" />
              <span>Compose Update →</span>
            </button>
          </div>
        </Card>

        {/* Card 3: Weekly Summary */}
        <Card className="flex flex-col justify-between p-5 min-h-[185px] border border-border hover:border-primary/50 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="micro-label text-text-secondary">Weekly Summary</span>
              <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-heading font-extrabold text-base text-text">
                Week 42 Logged
              </span>
              <p className="text-xs text-text-secondary">
                33.6 hrs logged · On schedule
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <button
              onClick={() => navigate('/employee/work/activity-reports')}
              className="w-full h-8 px-3 rounded-full border border-border bg-surface hover:bg-surface-muted text-text text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Generate Report →</span>
            </button>
          </div>
        </Card>

        {/* Card 4: Leave Balance */}
        <Card className="flex flex-col justify-between p-5 min-h-[185px] border border-border hover:border-primary/50 transition-all hover:shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="micro-label text-text-secondary">Leave Balance</span>
              <div className="w-8 h-8 rounded-full bg-primary-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-base text-text">
                  {clRemaining} CL / {slRemaining} SL
                </span>
                <span className="text-[11px] font-semibold text-text-secondary">Available</span>
              </div>
              <p className="text-xs text-text-secondary">
                {leaveBalance.clUsed} CL used · 12 CL / 10 SL quota
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <button
              onClick={() => navigate('/employee/time/leaves')}
              className="w-full h-8 px-3 rounded-full border border-border bg-surface hover:bg-surface-muted text-text text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>View Leave Balance →</span>
            </button>
          </div>
        </Card>
      </div>

      {/* 4. MAIN WORKSPACE 2-COLUMN LAYOUT */}
      <RailLayout
        rail={
          <>
            {/* Wellness Check-in (Confidential) */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="micro-label text-text-secondary">Wellness Check-in</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary-50 text-primary">
                  Confidential
                </span>
              </div>
              <p className="text-xs text-text-secondary">How are you feeling about work today?</p>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { rating: 1, label: 'Tough' },
                  { rating: 2, label: 'Tired' },
                  { rating: 3, label: 'Okay' },
                  { rating: 4, label: 'Good' },
                  { rating: 5, label: 'Great' },
                ].map(item => {
                  const isSelected = wellnessSelected === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setWellnessSelected(item.label)}
                      aria-label={`${item.rating} star rating - ${item.label}`}
                      className={`p-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? 'bg-primary text-white scale-105 shadow-xs'
                          : 'bg-surface-muted hover:bg-surface border border-border text-text'
                      }`}
                    >
                      <div className="flex items-center justify-center -space-x-0.5 my-0.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected
                                ? 'fill-amber-300 text-amber-300'
                                : 'fill-amber-400 text-amber-400'
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold block leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {wellnessSelected && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-center pt-1 animate-fadeIn">
                  ✓ Recorded! Take regular stretch breaks today.
                </p>
              )}
            </Card>

            {/* Share Feedback (Confidential) */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="micro-label text-text-secondary">Share Feedback</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary-50 text-primary">
                  Confidential
                </span>
              </div>

              {feedbackSuccess ? (
                <div className="p-4 rounded-2xl bg-success/10 text-success text-center space-y-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-success" strokeWidth={2} />
                  <p className="text-xs font-semibold text-text">Feedback recorded</p>
                  <p className="text-[11px] text-text-secondary">
                    Submitted anonymously to People Operations.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="feedback-cat-select" className="block text-[11px] font-medium text-text-secondary mb-1">
                      Category
                    </label>
                    <select
                      id="feedback-cat-select"
                      name="feedback-category"
                      value={feedbackCategory}
                      onChange={e => setFeedbackCategory(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-input border border-border bg-surface text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <option value="General">General Operations</option>
                      <option value="Management">Management & Leadership</option>
                      <option value="Culture">Company Culture & Inclusivity</option>
                      <option value="Work Environment">Work Environment & Hybrid Tools</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      Overall Rating (Optional)
                    </label>
                    <StarRating value={feedbackRating} onChange={setFeedbackRating} size="md" />
                  </div>

                  <div>
                    <label htmlFor="feedback-text-area" className="block text-[11px] font-medium text-text-secondary mb-1">
                      Your Thoughts or Suggestions
                    </label>
                    <textarea
                      id="feedback-text-area"
                      name="feedback-text"
                      rows={3}
                      required
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder="Share what is working well or where we can improve…"
                      className="w-full p-2.5 rounded-input border border-border bg-surface text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none placeholder:text-text-tertiary"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={e => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                      />
                      <span>Submit anonymously</span>
                    </label>

                    <button
                      type="submit"
                      disabled={!feedbackText.trim()}
                      className="h-8 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" strokeWidth={1.75} />
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </Card>

            {/* Upcoming Birthdays & Holidays */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="micro-label text-text-secondary">Upcoming Dates & Holidays</span>
                <button
                  onClick={() => navigate('/employee/company/handbook')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  View all →
                </button>
              </div>

              <div className="space-y-3">
                {holidays.slice(0, 3).map(hol => (
                  <div
                    key={hol.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-bold text-[10px]">
                        {hol.date.split('-')[2]}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{hol.title}</p>
                        <p className="text-[10px] text-text-secondary">
                          {hol.day} · {hol.location}
                        </p>
                      </div>
                    </div>
                    <StatusBadge variant="neutral" size="sm" showDot={false}>
                      {hol.type}
                    </StatusBadge>
                  </div>
                ))}

                {/* Colleague Birthday */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-magenta-50 dark:bg-magenta-50/20 text-magenta flex items-center justify-center font-bold text-xs">
                      <Cake className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-text">Priya Patel's Birthday</p>
                      <p className="text-[10px] text-text-secondary">Oct 28 · in 6 days</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-magenta font-semibold">Celebrate!</span>
                </div>
              </div>
            </Card>
          </>
        }
      >
        {/* Main Column (8/12) */}

        {/* 1. My Priority Tasks Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text font-heading">My Priority Tasks</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-muted border border-border text-text-tertiary">
                  Jira Sync
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Sprint milestones & deliverables
              </p>
            </div>

            {/* Segmented Filter */}
            <div className="flex items-center p-1 rounded-lg bg-surface-muted border border-border text-xs">
              <button
                onClick={() => setTaskFilter('today')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  taskFilter === 'today'
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTaskFilter('week')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  taskFilter === 'week'
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                This week
              </button>
              <button
                onClick={() => setTaskFilter('completed')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  taskFilter === 'completed'
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Search & Sort Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                name="task-search"
                autoComplete="off"
                spellCheck={false}
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                placeholder="Search tasks by title, project key, or keyword…"
                aria-label="Search tasks"
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-surface text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-text-tertiary"
              />
              {taskSearch && (
                <button
                  onClick={() => setTaskSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setTaskSort(prev => (prev === 'dueDate' ? 'priority' : 'dueDate'))}
              className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs text-text-secondary hover:text-text flex items-center gap-1.5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Toggle sort order"
              aria-label="Toggle sort order"
            >
              <ArrowUpDown className="w-3 h-3 text-text-tertiary" />
              <span>Sort: {taskSort === 'dueDate' ? 'Due Date' : 'Priority'}</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden shadow-xs">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-secondary space-y-1">
                <CheckSquare className="w-7 h-7 mx-auto text-text-tertiary/60" />
                <p className="font-semibold text-text">No tasks matching current filter</p>
                <p className="text-text-tertiary">All assigned sprint deliverables are up to date.</p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const isDone = task.status === 'Submitted' || task.status === 'Verified';

                return (
                  <motion.div
                    key={task.id}
                    whileHover={{ x: 3, backgroundColor: 'rgba(0, 113, 227, 0.04)' }}
                    transition={{ duration: 0.15 }}
                    className="p-4 flex items-start sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`w-5 h-5 rounded-md mt-0.5 sm:mt-0 flex items-center justify-center border transition-all ${
                          isDone
                            ? 'bg-success border-success text-white'
                            : 'border-border-strong hover:border-primary text-transparent'
                        }`}
                        aria-label={`Toggle task ${task.title}`}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </motion.button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isDone ? 'line-through text-text-tertiary' : 'text-text'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-muted text-text-tertiary">
                            {task.project}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <p className="text-[11px] text-text-tertiary mt-0.5">
                          Owner: {currentUser.name} · Due: {task.dueDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {task.isOverdue && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-danger/10 text-danger whitespace-nowrap">
                          Overdue
                        </span>
                      )}
                      <StatusBadge
                        variant={
                          task.priority === 'Urgent'
                            ? 'danger'
                            : task.priority === 'High'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </StatusBadge>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-xs font-semibold text-primary hover:underline hidden sm:inline"
                      >
                        {isDone ? 'Completed' : 'Submit →'}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-text-tertiary">
              Showing {filteredTasks.length} of {userTasks.length} tasks
            </span>
            <button
              onClick={() => navigate('/employee/work/tasks')}
              className="font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all tasks in workspace →
            </button>
          </div>
        </div>

        {/* 2. "This week at a glance" Horizontal 7-Day Timeline */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text font-heading">This Week at a Glance</h2>
              <p className="text-xs text-text-secondary">
                Mon Oct 19 – Sun Oct 25 · 33.6 hours confirmed
              </p>
            </div>
            <button
              onClick={() => navigate('/employee/time/timesheets')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Full Timesheet →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(item => {
              const isToday = item.status === 'today';
              const isWeekend = item.status === 'weekend';

              return (
                <motion.div
                  key={item.day}
                  whileHover={{ y: -4, scale: 1.03, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                  transition={{ duration: 0.15 }}
                  className={`p-3 rounded-xl border text-center transition-colors cursor-default select-none ${
                    isToday
                      ? 'bg-primary-50 dark:bg-primary-50/30 border-primary ring-2 ring-primary/20 shadow-sm'
                      : isWeekend
                      ? 'bg-surface-muted/40 border-border/50 text-text-tertiary'
                      : 'bg-surface border-border hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`block text-xs font-semibold uppercase tracking-wider ${
                      isToday ? 'text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {item.day}
                  </span>
                  <span className="block text-[11px] text-text-tertiary mt-0.5">
                    {item.date.split(' ')[1]}
                  </span>

                  <div className="mt-3 pt-2 border-t border-border/60">
                    <span
                      className={`block font-mono text-xs font-bold ${
                        isToday ? 'text-primary' : isWeekend ? 'text-text-tertiary' : 'text-text'
                      }`}
                    >
                      {item.hours}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-tight block mt-0.5 ${
                        item.status === 'present'
                          ? 'text-success'
                          : item.status === 'late'
                          ? 'text-spark'
                          : isToday
                          ? 'text-primary'
                          : 'text-text-tertiary'
                      }`}
                    >
                      {item.status === 'today' ? 'Active' : item.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </RailLayout>
    </div>
  );
};
