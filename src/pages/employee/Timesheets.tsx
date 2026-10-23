import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  RotateCcw,
  Send,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RailLayout } from '../../components/ui/RailLayout';

export const Timesheets: React.FC = () => {
  const {
    timesheets,
    updateTimesheetDay,
    submitTimesheet,
  } = useStore();

  const [activePeriodId, setActivePeriodId] = useState<string>(timesheets[1]?.id || timesheets[0]?.id);
  const activePeriod = timesheets.find(p => p.id === activePeriodId) || timesheets[0];

  const [quickHours, setQuickHours] = useState<number>(8);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Quick fill weekdays
  const handleQuickFill = (hours: number) => {
    if (activePeriod.status !== 'Draft') return;
    if (hours < 0 || hours > 24) {
      setValidationWarning('Hours per day must be between 0 and 24.');
      return;
    }
    setValidationWarning(null);

    activePeriod.days.forEach(d => {
      if (!d.isWeekend) {
        updateTimesheetDay(activePeriod.id, d.date, hours, d.overtime, d.notes || 'Athena Sprint Deliverables');
      }
    });
    setSuccessMessage(`Applied ${hours}h to all weekdays!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleClearPeriod = () => {
    if (activePeriod.status !== 'Draft') return;
    activePeriod.days.forEach(d => {
      updateTimesheetDay(activePeriod.id, d.date, 0, 0, '');
    });
    setValidationWarning(null);
    setSuccessMessage('Cleared all hours for this billing period.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCopyPreviousWeek = () => {
    handleQuickFill(8);
  };

  const handleDayChange = (date: string, regularVal: number, overtimeVal: number, notesVal: string) => {
    if (activePeriod.status !== 'Draft') return;

    const safeRegular = Math.max(0, Math.min(24, isNaN(regularVal) ? 0 : regularVal));
    const safeOvertime = Math.max(0, Math.min(12, isNaN(overtimeVal) ? 0 : overtimeVal));

    if (safeRegular + safeOvertime > 24) {
      setValidationWarning(`Total hours on ${date} cannot exceed 24 hours.`);
      return;
    }

    if (safeRegular + safeOvertime > 12) {
      setValidationWarning(`Notice: ${date} has ${safeRegular + safeOvertime} hours logged (>12h requires manager review).`);
    } else {
      setValidationWarning(null);
    }

    updateTimesheetDay(activePeriod.id, date, safeRegular, safeOvertime, notesVal);
  };

  const handleSubmitPeriod = () => {
    if (totalHours === 0) {
      setValidationWarning('Cannot submit an empty timesheet with 0 hours logged.');
      return;
    }
    setValidationWarning(null);
    submitTimesheet(activePeriod.id);
    setSuccessMessage('Timesheet submitted to Marcus Chen for client billing signoff!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const totalRegular = useMemo(
    () => activePeriod.days.reduce((acc, curr) => acc + curr.regular, 0),
    [activePeriod]
  );
  const totalOvertime = useMemo(
    () => activePeriod.days.reduce((acc, curr) => acc + curr.overtime, 0),
    [activePeriod]
  );
  const totalHours = totalRegular + totalOvertime;

  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Day', 'Regular Hours', 'Overtime Hours', 'Total Hours', 'Client Notes'],
      ...activePeriod.days.map(d => [
        d.date,
        d.day,
        d.regular.toString(),
        d.overtime.toString(),
        (d.regular + d.overtime).toString(),
        `"${d.notes.replace(/"/g, '""')}"`,
      ]),
      ['TOTALS', '', totalRegular.toString(), totalOvertime.toString(), totalHours.toString(), ''],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `timesheet_${activePeriod.id}_${activePeriod.periodLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Timesheets' }]}
        title={`Timesheet · ${activePeriod.periodLabel}`}
        subtitle="Log confirmed client deliverable hours for payroll billing and project reconciliation"
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge
              variant={
                activePeriod.status === 'Approved'
                  ? 'success'
                  : activePeriod.status === 'Submitted'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {activePeriod.status}
            </StatusBadge>

            <button
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-btn border border-border bg-surface text-text hover:bg-surface-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-text-tertiary" strokeWidth={1.75} />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Deadline Notice */}
      <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-bold text-text">Bi-weekly Submission Deadline: </span>
            <span className="text-text-secondary">
              Timesheets must be locked and submitted every alternating Friday by 5:00 PM CST for client billing and ADP payroll processing.
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-primary font-semibold shrink-0">
          Cutoff: Oct 23, 17:00 CST
        </span>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
          <span>{successMessage}</span>
        </div>
      )}

      {validationWarning && (
        <div className="p-3.5 rounded-xl bg-[#FFF4DF] text-[#B45309] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* 2-Column Command Center: Main Table + Right Rail History */}
      <RailLayout
        rail={
          <>
            {/* Summary KPI Card */}
            <Card className="space-y-4">
              <span className="micro-label text-text-secondary">Period Summary</span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-surface-muted">
                  <span className="text-[11px] text-text-secondary">Regular Hours</span>
                  <p className="font-heading font-extrabold text-xl text-text mt-0.5">{totalRegular}h</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-muted">
                  <span className="text-[11px] text-text-secondary">Overtime</span>
                  <p className="font-heading font-extrabold text-xl text-primary mt-0.5">{totalOvertime}h</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-50/20 border border-primary-100 flex items-center justify-between">
                <span className="text-xs font-bold text-primary">Total Billable:</span>
                <span className="font-heading font-extrabold text-lg text-primary">{totalHours} Hours</span>
              </div>

              {activePeriod.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={handleSubmitPeriod}
                  className="w-full h-10 rounded-btn hero-gradient text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity"
                >
                  Submit Timesheet for Approval →
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-surface-muted border border-border text-center space-y-1">
                  <span className="text-xs font-bold text-text">
                    {activePeriod.status === 'Approved' ? '✓ Locked & Approved' : '⏳ Pending Manager Review'}
                  </span>
                  <p className="text-[11px] text-text-secondary">
                    {activePeriod.approvedBy ? `Signed off by ${activePeriod.approvedBy}` : 'Awaiting signoff from Marcus Chen'}
                  </p>
                </div>
              )}
            </Card>

            {/* Historical Timesheets List */}
            <Card className="space-y-3">
              <span className="micro-label text-text-secondary">Timesheet Periods</span>
              <div className="space-y-2">
                {timesheets.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePeriodId(p.id);
                      setValidationWarning(null);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      activePeriodId === p.id
                        ? 'bg-primary-50 dark:bg-primary-50/30 border-primary ring-2 ring-primary/20'
                        : 'bg-surface border-border hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-text">{p.periodLabel}</span>
                      <StatusBadge
                        variant={
                          p.status === 'Approved'
                            ? 'success'
                            : p.status === 'Submitted'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {p.status}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span>Total: {p.totalHours} hrs</span>
                      {p.approvedBy && <span>Approved by {p.approvedBy}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        }
      >
        {/* Main (8/12): Quick Fill Bar + Daily Table */}
        <div className="space-y-4">
          {/* Quick Fill Action Bar */}
          {activePeriod.status === 'Draft' ? (
            <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-text-secondary">Quick Fill:</span>
                <button
                  type="button"
                  onClick={() => handleQuickFill(8)}
                  className="px-2.5 py-1 rounded-md bg-surface-muted hover:bg-primary-50 text-xs font-semibold text-text hover:text-primary border border-border"
                >
                  8h × Weekdays
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={quickHours}
                    onChange={e => setQuickHours(parseInt(e.target.value) || 0)}
                    className="w-12 h-7 px-1.5 text-xs text-center rounded border border-border bg-surface font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickFill(quickHours)}
                    className="px-2.5 py-1 rounded-md bg-surface-muted hover:bg-primary-50 text-xs font-semibold text-text hover:text-primary border border-border"
                  >
                    Fill Weekdays
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPreviousWeek}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-muted flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" strokeWidth={1.75} /> Copy Previous Week
                </button>
                <button
                  type="button"
                  onClick={handleClearPeriod}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-[#C81E3A] hover:bg-[#FDECEF] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} /> Clear Period
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-surface-muted border border-border flex items-center gap-2 text-xs text-text-secondary">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>
                This period is <strong>{activePeriod.status}</strong> and cannot be modified. To request edits, contact your approving manager.
              </span>
            </div>
          )}

          {/* Daily Table */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                    <th className="px-5 py-3">Day / Date</th>
                    <th className="px-4 py-3 w-28">Regular (h)</th>
                    <th className="px-4 py-3 w-28">Overtime (h)</th>
                    <th className="px-4 py-3 w-24">Total</th>
                    <th className="px-4 py-3">Project / Client Allocation Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activePeriod.days.map(d => {
                    const isWeekend = !!d.isWeekend;
                    const rowTotal = d.regular + d.overtime;
                    const isOverLimit = rowTotal > 12;

                    return (
                      <tr
                        key={d.date}
                        className={`transition-colors ${
                          isWeekend
                            ? 'bg-surface-muted/30 text-text-tertiary'
                            : isOverLimit
                            ? 'bg-[#FFF4DF]/20 hover:bg-[#FFF4DF]/30 text-text'
                            : 'hover:bg-primary-50/20 text-text'
                        }`}
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="font-bold">{d.day}</span>
                          <span className="text-[11px] text-text-tertiary ml-2 font-mono">{d.date}</span>
                          {isWeekend && (
                            <span className="text-[10px] ml-2 text-text-tertiary italic">Weekend</span>
                          )}
                        </td>

                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            disabled={isWeekend || activePeriod.status !== 'Draft'}
                            value={d.regular}
                            onChange={e =>
                              handleDayChange(
                                d.date,
                                parseFloat(e.target.value) || 0,
                                d.overtime,
                                d.notes
                              )
                            }
                            className="w-20 h-8 px-2 text-xs font-mono font-bold rounded border border-border bg-surface disabled:bg-surface-muted disabled:text-text-tertiary text-center focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>

                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            max="12"
                            step="0.5"
                            disabled={isWeekend || activePeriod.status !== 'Draft'}
                            value={d.overtime}
                            onChange={e =>
                              handleDayChange(
                                d.date,
                                d.regular,
                                parseFloat(e.target.value) || 0,
                                d.notes
                              )
                            }
                            className="w-20 h-8 px-2 text-xs font-mono rounded border border-border bg-surface disabled:bg-surface-muted disabled:text-text-tertiary text-center focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>

                        <td className="px-4 py-3 font-mono font-bold text-text">
                          <span className={isOverLimit ? 'text-[#B45309]' : ''}>{rowTotal}h</span>
                        </td>

                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder={isWeekend ? 'Off day' : 'e.g. [PRJ-ATHENA] Frontend sprint tasks...'}
                            disabled={isWeekend || activePeriod.status !== 'Draft'}
                            value={d.notes}
                            onChange={e =>
                              handleDayChange(
                                d.date,
                                d.regular,
                                d.overtime,
                                e.target.value
                              )
                            }
                            className="w-full h-8 px-2.5 text-xs rounded border border-border bg-surface disabled:bg-transparent disabled:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-text-tertiary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer Totals */}
                <tfoot>
                  <tr className="bg-surface-muted/60 font-bold border-t-2 border-border text-xs">
                    <td className="px-5 py-3">Totals</td>
                    <td className="px-4 py-3 font-mono">{totalRegular} hrs</td>
                    <td className="px-4 py-3 font-mono text-primary">{totalOvertime} hrs</td>
                    <td className="px-4 py-3 font-mono text-primary text-sm">{totalHours} hrs</td>
                    <td className="px-4 py-3 text-right">
                      {activePeriod.status === 'Draft' && (
                        <button
                          onClick={handleSubmitPeriod}
                          className="px-4 py-1.5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-xs hover:opacity-95"
                        >
                          Submit Timesheet →
                        </button>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </RailLayout>
    </div>
  );
};
