import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  List,
  Sparkles,
  Info,
  ShieldAlert,
  Send,
  Coffee,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { RailLayout } from '../../components/ui/RailLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const Attendance: React.FC = () => {
  const {
    currentUser,
    attendance,
    isClockedIn,
    clockInTime,
    clockIn,
    clockOut,
    attendanceCorrections,
    submitAttendanceCorrection,
  } = useStore();

  const [viewMode, setViewMode] = useState<'table' | 'heatmap' | 'corrections'>('table');
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionDate, setCorrectionDate] = useState('2026-10-21');
  const [correctionFirstIn, setCorrectionFirstIn] = useState('09:15');
  const [correctionLastOut, setCorrectionLastOut] = useState('18:45');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [correctionSuccess, setCorrectionSuccess] = useState(false);

  // Live timer for elapsed shift duration
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsedShiftDuration = useMemo(() => {
    if (!isClockedIn || !clockInTime) return '0h 00m 00s';
    const match = clockInTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return '5h 42m 10s';
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
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${diffHrs}h ${diffMins.toString().padStart(2, '0')}m ${diffSecs.toString().padStart(2, '0')}s`;
  }, [isClockedIn, clockInTime, currentTime]);

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCorrectionError(null);

    // Validation
    const todayStr = new Date().toISOString().split('T')[0];
    if (correctionDate > todayStr) {
      setCorrectionError('Missed-punch corrections cannot be requested for future dates.');
      return;
    }
    if (!correctionReason.trim() || correctionReason.trim().length < 10) {
      setCorrectionError('Please provide a substantive reason (minimum 10 characters).');
      return;
    }

    submitAttendanceCorrection({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: correctionDate,
      firstIn: correctionFirstIn,
      lastOut: correctionLastOut,
      reason: correctionReason.trim(),
    });

    setCorrectionSuccess(true);
    setTimeout(() => {
      setCorrectionSuccess(false);
      setCorrectionModalOpen(false);
      setCorrectionReason('');
    }, 2000);
  };

  const userCorrections = attendanceCorrections.filter(c => c.employeeId === currentUser.id);

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Attendance' }]}
        title="Attendance & Daily Punches"
        subtitle="Manage daily shifts, clock times, monthly log tables, and attendance corrections"
        actions={
          <div className="flex items-center gap-3">
            {/* Month Navigator */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface border border-border text-xs">
              <button
                className="p-1 rounded hover:bg-surface-muted text-text-secondary"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <span className="font-semibold text-text px-2">{currentMonth}</span>
              <button
                className="p-1 rounded hover:bg-surface-muted text-text-secondary"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-surface border border-border">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary-50 text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text'
                }`}
                title="Log Table"
              >
                <List className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Log Table</span>
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'heatmap'
                    ? 'bg-primary-50 text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text'
                }`}
                title="Calendar Heatmap"
              >
                <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Heatmap</span>
              </button>
              <button
                onClick={() => setViewMode('corrections')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'corrections'
                    ? 'bg-primary-50 text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text'
                }`}
                title="Correction Requests"
              >
                <FileCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Corrections ({userCorrections.length})</span>
              </button>
            </div>
          </div>
        }
      />

      {/* 3 Stat Tiles: Present, Late, Absent */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between p-5">
          <div>
            <span className="micro-label text-text-secondary">Days Present</span>
            <p className="text-kpi text-[#15803D] mt-1">{presentCount}</p>
            <p className="text-xs text-text-tertiary mt-0.5">Average: 9h 18m per shift</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E7F6EC] text-[#15803D] flex items-center justify-center font-bold">
            ✓
          </div>
        </Card>

        <Card className="flex items-center justify-between p-5">
          <div>
            <span className="micro-label text-text-secondary">Late Arrivals</span>
            <p className="text-kpi text-[#B45309] mt-1">{lateCount}</p>
            <p className="text-xs text-text-tertiary mt-0.5">Threshold: Punched after 09:30 AM</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFF4DF] text-[#B45309] flex items-center justify-center font-bold">
            !
          </div>
        </Card>

        <Card className="flex items-center justify-between p-5">
          <div>
            <span className="micro-label text-text-secondary">Unplanned Absences</span>
            <p className="text-kpi text-[#C81E3A] mt-1">{absentCount}</p>
            <p className="text-xs text-text-tertiary mt-0.5">Regularize via Leave portal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDECEF] text-[#C81E3A] flex items-center justify-center font-bold">
            ✕
          </div>
        </Card>
      </div>

      {/* 2-Column Command Center Layout */}
      <RailLayout
        rail={
          <>
            {/* Daily Punch Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="micro-label text-text-secondary">Daily Punch & Status</span>
                <span className="text-[11px] font-semibold text-text-tertiary">Shift: 09:30 – 18:30</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted text-center space-y-2 border border-border">
                <p className="text-xs text-text-secondary">Current Status</p>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isClockedIn ? 'bg-[#15803D] animate-pulse' : 'bg-text-tertiary'
                    }`}
                  />
                  <span className="font-heading font-extrabold text-lg text-text">
                    {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
                  </span>
                </div>
                {isClockedIn ? (
                  <div className="space-y-1 pt-1">
                    <p className="text-xs font-mono text-primary font-semibold">
                      First In: {clockInTime || '09:18 AM'}
                    </p>
                    <p className="text-xs font-mono text-text font-bold">
                      Elapsed: {elapsedShiftDuration}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-text-tertiary">
                    No active punch recorded today
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={isClockedIn ? clockOut : clockIn}
                className={`w-full h-11 rounded-btn font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isClockedIn
                    ? 'bg-[#C81E3A] hover:bg-[#a5172f] text-white'
                    : 'hero-gradient text-white hover:opacity-95'
                }`}
              >
                <Clock className="w-4 h-4" strokeWidth={1.75} />
                {isClockedIn ? 'Clock Out (Punch Out)' : 'Clock In (Punch In)'}
              </motion.button>

              {/* Breaks Notice */}
              <div className="p-3 rounded-lg bg-surface-muted/60 border border-border text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-text-secondary font-medium">
                  <Coffee className="w-3.5 h-3.5 text-text-tertiary" />
                  <span>Break Policy:</span>
                </div>
                <p className="text-[11px] text-text-tertiary leading-relaxed">
                  1-hour lunch break is automatically calculated into daily 9-hour shift continuity. Granular manual break pauses are not required for your role.
                </p>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setCorrectionModalOpen(true)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Submit an attendance correction request →
                </button>
              </div>
            </Card>

            {/* Attendance Guidelines Panel */}
            <Card variant="ink" className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
                <span className="text-xs font-bold uppercase tracking-wider text-text">
                  Attendance Guidelines
                </span>
              </div>
              <ul className="text-xs text-text-secondary space-y-2 pl-4 list-disc leading-relaxed">
                <li>
                  <strong className="text-text font-semibold">Punch in before 09:30 AM:</strong> Arrivals recorded after 9:30 AM are flagged as Late.
                </li>
                <li>
                  <strong className="text-text font-semibold">Minimum 9 hours:</strong> Core working time requires 9 logged hours per regular workday.
                </li>
                <li>
                  <strong className="text-text font-semibold">Punch out after 06:30 PM:</strong> Ensures shift continuity and overtime eligibility.
                </li>
                <li>
                  Corrections must be submitted within <strong className="text-text font-semibold">48 hours</strong> of the missed punch.
                </li>
              </ul>
            </Card>
          </>
        }
      >
        {/* Main 8/12: Table, Heatmap, or Corrections */}
        {viewMode === 'table' && (
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-text">
                Monthly Punch Log · October 2026
              </h3>
              <span className="text-xs text-text-tertiary">{attendance.length} entries recorded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">First In</th>
                    <th className="px-4 py-3">Last Out</th>
                    <th className="px-4 py-3">Total Hours</th>
                    <th className="px-4 py-3">Flags / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendance.map(record => (
                    <tr key={record.id} className="hover:bg-primary-50/20 transition-colors h-[52px]">
                      <td className="px-5 py-3 font-semibold text-text font-mono">
                        {record.date}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={
                            record.status === 'Present'
                              ? 'success'
                              : record.status === 'Late'
                              ? 'warning'
                              : record.status === 'Absent'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {record.status}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 font-mono text-text">{record.firstIn}</td>
                      <td className="px-4 py-3 font-mono text-text">{record.lastOut}</td>
                      <td className="px-4 py-3 font-bold text-text font-mono">
                        {record.totalHours}
                      </td>
                      <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                        {record.flags && record.flags.length > 0 ? (
                          <span className="text-[#C81E3A] font-semibold">
                            {record.flags.join(', ')}
                          </span>
                        ) : record.notes ? (
                          <span>{record.notes}</span>
                        ) : (
                          <span className="text-text-tertiary">Standard shift</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'heatmap' && (
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text">
              October 2026 Attendance Heatmap
            </h3>
            <p className="text-xs text-text-secondary">
              Color intensity indicates hours logged. Green = 9+ hours, Amber = Late, Red = Absent.
            </p>

            <div className="grid grid-cols-7 gap-2 pt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center font-bold text-[11px] text-text-tertiary">
                  {d}
                </div>
              ))}
              {Array.from({ length: 31 }).map((_, idx) => {
                const dayNum = idx + 1;
                const isLate = dayNum === 20;
                const isAbsent = dayNum === 13;
                const isWeekend = dayNum % 7 === 3 || dayNum % 7 === 4;
                const isFuture = dayNum > 22;

                return (
                  <div
                    key={dayNum}
                    className={`h-16 rounded-xl border p-2 flex flex-col justify-between transition-all ${
                      isFuture
                        ? 'bg-surface-muted/30 border-border/40 text-text-tertiary'
                        : isLate
                        ? 'bg-[#FFF4DF] border-[#B45309]/30 text-[#B45309]'
                        : isAbsent
                        ? 'bg-[#FDECEF] border-[#C81E3A]/30 text-[#C81E3A]'
                        : isWeekend
                        ? 'bg-surface-muted border-border text-text-tertiary'
                        : 'bg-[#E7F6EC]/60 border-[#15803D]/30 text-[#15803D]'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">{dayNum}</span>
                    <span className="text-[10px] font-semibold text-right">
                      {isFuture ? '--' : isWeekend ? 'Off' : isLate ? '9.3h' : isAbsent ? '0h' : '9+ h'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {viewMode === 'corrections' && (
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs space-y-4">
            <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-text">
                  Attendance Correction Requests
                </h3>
                <p className="text-xs text-text-secondary">
                  Track supervisor reviews for missed punches and time adjustments
                </p>
              </div>
              <button
                onClick={() => setCorrectionModalOpen(true)}
                className="px-3 py-1.5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-xs"
              >
                + New Correction
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                    <th className="px-5 py-3">Request ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Requested Timing</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {userCorrections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-text-secondary">
                        No correction requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    userCorrections.map(corr => (
                      <tr key={corr.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-5 py-3.5 font-bold font-mono text-text">{corr.id}</td>
                        <td className="px-4 py-3.5 font-mono text-text">{corr.date}</td>
                        <td className="px-4 py-3.5 font-mono text-text">
                          {corr.firstIn} – {corr.lastOut}
                        </td>
                        <td className="px-4 py-3.5 max-w-xs text-text-secondary truncate">
                          {corr.reason}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge
                            variant={
                              corr.status === 'Approved'
                                ? 'success'
                                : corr.status === 'Rejected'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {corr.status}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3.5 text-text-tertiary font-mono">{corr.submittedAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </RailLayout>

      {/* Attendance Correction Modal */}
      <Modal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title="Attendance Correction Request"
        subtitle="Submit a correction for missed punch or incorrect timing"
      >
        {correctionSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Correction Submitted</h4>
            <p className="text-xs text-text-secondary">
              Your correction request for {correctionDate} has been sent to Marcus Chen for signoff.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCorrectionSubmit} className="space-y-4">
            {correctionError && (
              <div className="p-3 rounded-lg bg-[#FDECEF] text-[#C81E3A] text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{correctionError}</span>
              </div>
            )}

            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Date of Missed Punch
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={correctionDate}
                onChange={e => setCorrectionDate(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Actual First In</label>
                <input
                  type="time"
                  required
                  value={correctionFirstIn}
                  onChange={e => setCorrectionFirstIn(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block micro-label text-text-secondary mb-1">Actual Last Out</label>
                <input
                  type="time"
                  required
                  value={correctionLastOut}
                  onChange={e => setCorrectionLastOut(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Reason for Discrepancy (Min. 10 chars)
              </label>
              <textarea
                rows={3}
                required
                value={correctionReason}
                onChange={e => setCorrectionReason(e.target.value)}
                placeholder="Explain the reason (e.g. Turnstile scanner error, offsite client sprint meeting)..."
                className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-text-tertiary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-xs"
              >
                Submit Correction →
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
