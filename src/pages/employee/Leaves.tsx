import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Info,
  CalendarDays,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { HolidayItem, LeaveRequest } from '../../types';

export const Leaves: React.FC = () => {
  const {
    currentUser,
    leaveBalance,
    leaveRequests,
    submitLeaveRequest,
    cancelLeaveRequest,
    holidays,
  } = useStore();

  const [activeHistoryTab, setActiveHistoryTab] = useState<'all' | 'half' | 'holidays'>('all');

  // Form state
  const [leaveType, setLeaveType] = useState<'CL' | 'SL' | 'LOP'>('CL');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'First Half' | 'Second Half'>('First Half');
  const [fromDate, setFromDate] = useState('2026-11-10');
  const [toDate, setToDate] = useState('2026-11-11');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const clRemaining = leaveBalance.clTotal - leaveBalance.clUsed;
  const slRemaining = leaveBalance.slTotal - leaveBalance.slUsed;

  // Calculate actual business days (excluding Sat, Sun, and official holidays)
  const calculatedDays = useMemo(() => {
    if (isHalfDay) return 0.5;
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (start > end) return 0;

    const holidaySet = new Set(holidays.map(h => h.date));
    let count = 0;
    const cur = new Date(start);

    while (cur <= end) {
      const day = cur.getDay();
      const iso = cur.toISOString().split('T')[0];
      // Exclude weekends and public holidays
      if (day !== 0 && day !== 6 && !holidaySet.has(iso)) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [fromDate, toDate, isHalfDay, holidays]);

  const userLeaveRequests = useMemo(
    () => leaveRequests.filter(r => r.employeeId === currentUser.id),
    [leaveRequests, currentUser.id]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reason.trim()) {
      setFormError('Please state the purpose of your leave.');
      return;
    }

    const effectiveToDate = isHalfDay ? fromDate : toDate;

    if (fromDate > effectiveToDate) {
      setFormError('Start date cannot be after end date.');
      return;
    }

    if (calculatedDays <= 0) {
      setFormError('The selected range consists exclusively of weekends or company holidays (0 business days).');
      return;
    }

    // Balance check
    if (leaveType === 'CL' && calculatedDays > clRemaining) {
      setFormError(`Insufficient Casual Leave balance. Requested: ${calculatedDays} days, Available: ${clRemaining} CL. Consider applying for LOP.`);
      return;
    }
    if (leaveType === 'SL' && calculatedDays > slRemaining) {
      setFormError(`Insufficient Sick Leave balance. Requested: ${calculatedDays} days, Available: ${slRemaining} SL.`);
      return;
    }

    // Overlap check
    const startTimestamp = new Date(fromDate).getTime();
    const endTimestamp = new Date(effectiveToDate).getTime();

    const overlapping = userLeaveRequests.find(r => {
      if (r.status === 'Rejected' || r.status === 'Cancelled') return false;
      const exStart = new Date(r.fromDate).getTime();
      const exEnd = new Date(r.toDate).getTime();
      return startTimestamp <= exEnd && endTimestamp >= exStart;
    });

    if (overlapping) {
      setFormError(`You already have an active leave request (${overlapping.id}) overlapping this date range (${overlapping.fromDate} to ${overlapping.toDate}).`);
      return;
    }

    submitLeaveRequest({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      type: leaveType,
      isHalfDay,
      halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
      fromDate,
      toDate: effectiveToDate,
      days: calculatedDays,
      reason: reason.trim(),
    });

    setSubmitSuccess(`Application for ${calculatedDays} ${calculatedDays === 1 ? 'day' : 'days'} submitted successfully!`);
    setReason('');
    setTimeout(() => setSubmitSuccess(null), 4000);
  };

  const displayedRequests = useMemo(() => {
    if (activeHistoryTab === 'all') return userLeaveRequests;
    if (activeHistoryTab === 'half') return userLeaveRequests.filter(r => r.isHalfDay);
    return [];
  }, [activeHistoryTab, userLeaveRequests]);

  const monthChips = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Time Off & Leaves' }]}
        title="Leave Management & Balances"
        subtitle="Apply for casual/sick leave, monitor accrual meters, and review approval audit trails"
      />

      {/* Top Row: 3 Balance Meters in One Hairline-Divided Strip */}
      <div className="w-full bg-surface border border-border rounded-xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Meter 1: Casual Leave (CL) */}
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="micro-label text-text-secondary">Casual Leave (CL)</span>
              <p className="text-xs text-text-tertiary">Annual quota: {leaveBalance.clTotal} days</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary border border-primary-100">
              {clRemaining} Days Left
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-kpi text-text">{clRemaining}</span>
              <span className="text-xs text-text-secondary">{leaveBalance.clUsed} days used</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full hero-gradient rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (clRemaining / leaveBalance.clTotal) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50">
            <span className="text-[10px] text-text-tertiary mr-1">CY Accrual:</span>
            {monthChips.map((m, idx) => (
              <span
                key={m}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  idx <= 4 ? 'bg-primary-50 text-primary font-semibold' : 'text-text-tertiary'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Meter 2: Sick Leave (SL) */}
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="micro-label text-text-secondary">Sick Leave (SL)</span>
              <p className="text-xs text-text-tertiary">Medical & recovery: {leaveBalance.slTotal} days</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-magenta-50 text-magenta border border-magenta-100">
              {slRemaining} Days Left
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-kpi text-text">{slRemaining}</span>
              <span className="text-xs text-text-secondary">{leaveBalance.slUsed} days used</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-magenta rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (slRemaining / leaveBalance.slTotal) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50">
            <span className="text-[10px] text-text-tertiary mr-1">CY Accrual:</span>
            {monthChips.map((m, idx) => (
              <span
                key={m}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  idx <= 4 ? 'bg-magenta-50 text-magenta font-semibold' : 'text-text-tertiary'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Meter 3: Loss of Pay (LOP) */}
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="micro-label text-text-secondary">Loss of Pay (LOP)</span>
              <p className="text-xs text-text-tertiary">Unpaid emergency leaves</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border">
              {leaveBalance.lopDays} Days
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-kpi text-text">{leaveBalance.lopDays}</span>
              <span className="text-xs text-[#15803D] font-medium">Clean Record</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-border-strong rounded-full"
                style={{ width: `${Math.min(100, leaveBalance.lopDays * 10)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50 text-[11px] text-text-secondary">
            <Info className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span>Requires prior VP or HR approval</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 5/12 Leave Form + Right 7/12 History & Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (5/12): Leave Request Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-heading font-bold text-base text-text">Apply for Leave</h3>
              <span className="text-xs text-primary font-semibold">
                Available: {leaveType === 'CL' ? `${clRemaining} CL` : leaveType === 'SL' ? `${slRemaining} SL` : 'Unlimited LOP'}
              </span>
            </div>

            {submitSuccess && (
              <div className="p-3.5 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{submitSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-xl bg-[#FDECEF] text-[#C81E3A] text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="block micro-label text-text-secondary mb-1.5">Leave Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType('CL')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      leaveType === 'CL'
                        ? 'hero-gradient text-white border-transparent shadow-xs'
                        : 'bg-surface border-border text-text hover:bg-surface-muted'
                    }`}
                  >
                    Casual ({clRemaining})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('SL')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      leaveType === 'SL'
                        ? 'hero-gradient text-white border-transparent shadow-xs'
                        : 'bg-surface border-border text-text hover:bg-surface-muted'
                    }`}
                  >
                    Sick ({slRemaining})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('LOP')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      leaveType === 'LOP'
                        ? 'bg-text text-white border-transparent shadow-xs'
                        : 'bg-surface border-border text-text hover:bg-surface-muted'
                    }`}
                  >
                    LOP (Unpaid)
                  </button>
                </div>
              </div>

              {/* Half-Day Checkbox */}
              <div className="p-3 rounded-lg bg-surface-muted border border-border space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text">
                  <input
                    type="checkbox"
                    checked={isHalfDay}
                    onChange={e => setIsHalfDay(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                  />
                  <span>Apply as Half-Day Leave (0.5 day deduction)</span>
                </label>

                {isHalfDay && (
                  <div className="flex items-center gap-3 pt-1 pl-6">
                    <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="radio"
                        name="period"
                        checked={halfDayPeriod === 'First Half'}
                        onChange={() => setHalfDayPeriod('First Half')}
                        className="text-primary"
                      />
                      <span>First Half (09:30 – 14:00)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="radio"
                        name="period"
                        checked={halfDayPeriod === 'Second Half'}
                        onChange={() => setHalfDayPeriod('Second Half')}
                        className="text-primary"
                      />
                      <span>Second Half (14:00 – 18:30)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block micro-label text-text-secondary mb-1">
                    {isHalfDay ? 'Date' : 'From Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {!isHalfDay ? (
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">To Date</label>
                    <input
                      type="date"
                      required
                      min={fromDate}
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col justify-end">
                    <div className="h-10 px-3 rounded-input border border-border bg-surface-muted flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">Deduction:</span>
                      <span className="font-bold text-primary font-mono">0.5 Day</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Real Calculation Breakdown */}
              <div className="p-3 rounded-lg bg-surface-muted/60 border border-border flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Business Days to Deduct:</span>
                <span className="font-heading font-extrabold text-sm text-primary">
                  {calculatedDays} {calculatedDays === 1 ? 'Working Day' : 'Working Days'}
                </span>
              </div>

              {/* Reason */}
              <div>
                <label className="block micro-label text-text-secondary mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Detail the purpose of leave and work handoff context..."
                  className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-text-tertiary"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full h-10 rounded-btn hero-gradient text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity"
              >
                Submit Leave Application →
              </button>
            </form>
          </Card>
        </div>

        {/* Right (7/12): Tabs Leave History & Upcoming Holiday Calendar */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-0 overflow-hidden shadow-xs">
            {/* Tabs Header */}
            <div className="px-5 pt-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveHistoryTab('all')}
                  className={`pb-3 text-xs font-semibold relative transition-colors ${
                    activeHistoryTab === 'all' ? 'text-primary' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  Leave History ({userLeaveRequests.length})
                  {activeHistoryTab === 'all' && (
                    <motion.span
                      layoutId="leaveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveHistoryTab('half')}
                  className={`pb-3 text-xs font-semibold relative transition-colors ${
                    activeHistoryTab === 'half' ? 'text-primary' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  Half-Day ({userLeaveRequests.filter(r => r.isHalfDay).length})
                  {activeHistoryTab === 'half' && (
                    <motion.span
                      layoutId="leaveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveHistoryTab('holidays')}
                  className={`pb-3 text-xs font-semibold relative transition-colors ${
                    activeHistoryTab === 'holidays' ? 'text-primary' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  Holidays ({holidays.length})
                  {activeHistoryTab === 'holidays' && (
                    <motion.span
                      layoutId="leaveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* History Table */}
            {activeHistoryTab !== 'holidays' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                      <th className="px-5 py-3">Type / Req ID</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-text-secondary">
                          No leave records found in this view.
                        </td>
                      </tr>
                    ) : (
                      displayedRequests.map(req => (
                        <tr key={req.id} className="hover:bg-primary-50/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-text">{req.type}</span>
                            <span className="block text-[10px] text-text-tertiary font-mono">
                              {req.id}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-medium text-text">
                              {req.fromDate} {req.fromDate !== req.toDate ? `to ${req.toDate}` : ''}
                            </span>
                            {req.isHalfDay && (
                              <span className="block text-[10px] text-primary">
                                {req.halfDayPeriod}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-text">
                            {req.days} {req.days === 1 ? 'day' : 'days'}
                          </td>
                          <td className="px-4 py-3.5 max-w-[170px]">
                            <p className="truncate text-text">{req.reason}</p>
                            {req.hrNote && (
                              <p className="text-[10px] text-text-tertiary mt-0.5 italic">
                                Note: {req.hrNote}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge
                              variant={
                                req.status === 'Approved'
                                  ? 'success'
                                  : req.status === 'Rejected'
                                  ? 'danger'
                                  : req.status === 'Cancelled'
                                  ? 'neutral'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {req.status}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3.5 text-text-secondary">
                            {req.status === 'Pending' ? (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to cancel request ${req.id}? Deducted days will be restored.`)) {
                                    cancelLeaveRequest(req.id);
                                  }
                                }}
                                className="text-[11px] font-bold text-[#EE0014] hover:underline"
                              >
                                Cancel
                              </button>
                            ) : (
                              <span className="text-[11px] text-text-tertiary">
                                {req.actionedBy || 'Archived'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                <p className="text-xs text-text-secondary mb-3">
                  Official 2026 MHK company holidays. These days are excluded from leave balance deductions.
                </p>
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {holidays.map(hol => (
                    <div key={hol.id} className="p-3 flex items-center justify-between text-xs hover:bg-surface-muted">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary font-bold text-xs flex items-center justify-center">
                          {hol.date.split('-')[2]}
                        </div>
                        <div>
                          <p className="font-bold text-text">{hol.title}</p>
                          <p className="text-[11px] text-text-secondary">
                            {hol.date} ({hol.day}) · {hol.location}
                          </p>
                        </div>
                      </div>
                      <StatusBadge variant="neutral" size="sm" showDot={false}>
                        {hol.type}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
