import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Download,
  AlertTriangle,
  Calendar,
  Lock,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const Payroll: React.FC = () => {
  const { users } = useStore();

  const [activeCycle, setActiveCycle] = useState('October 2026');
  const [cycleStatus, setCycleStatus] = useState<'Draft' | 'Finalized'>('Draft');
  const [payslipModalUser, setPayslipModalUser] = useState<any | null>(null);
  const [finalizedSuccess, setFinalizedSuccess] = useState(false);

  const totalHeadcount = users.length;
  const grossMonthlyPayout = 124500;
  const totalTaxDeductions = 28650;
  const netMonthlyDisbursement = grossMonthlyPayout - totalTaxDeductions;

  const handleFinalizePayroll = () => {
    setCycleStatus('Finalized');
    setFinalizedSuccess(true);
    setTimeout(() => setFinalizedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Payroll' }]}
        title={`Payroll Execution · ${activeCycle}`}
        subtitle="Finalize monthly salary disbursements, federal withholding taxes, and payslip distribution"
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge variant={cycleStatus === 'Finalized' ? 'success' : 'warning'}>
              {cycleStatus === 'Finalized' ? 'FINALIZED & DISBURSED' : 'DRAFT IN REVIEW'}
            </StatusBadge>

            {cycleStatus === 'Draft' ? (
              <button
                onClick={handleFinalizePayroll}
                className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
              >
                Finalize October Payroll Run →
              </button>
            ) : (
              <button
                onClick={() => alert('Downloading bank ACH direct deposit batch file')}
                className="h-9 px-3 rounded-btn border border-border bg-surface text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-text-tertiary" /> Export ACH Batch
              </button>
            )}
          </div>
        }
      />

      {finalizedSuccess && (
        <div className="p-4 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={2} />
          <span>
            October 2026 Payroll run finalized! Direct deposit instructions queued for Chase Bank NA.
          </span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="micro-label text-text-secondary">Gross Payroll Outlay</span>
          <p className="text-kpi text-text mt-1 font-mono">${grossMonthlyPayout.toLocaleString()}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Across {totalHeadcount} employees</p>
        </Card>

        <Card className="p-5">
          <span className="micro-label text-text-secondary">Statutory Taxes & FICA</span>
          <p className="text-kpi text-[#B45309] mt-1 font-mono">
            -${totalTaxDeductions.toLocaleString()}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">Federal, State & Medicare</p>
        </Card>

        <Card className="p-5 border-primary-100 bg-primary-50/30">
          <span className="micro-label text-primary font-bold">Net Direct Deposit</span>
          <p className="text-kpi text-primary mt-1 font-mono">
            ${netMonthlyDisbursement.toLocaleString()}
          </p>
          <p className="text-xs text-primary/70 mt-0.5">Direct deposit batch ready</p>
        </Card>

        <Card className="p-5">
          <span className="micro-label text-text-secondary">Pay Date</span>
          <p className="text-kpi text-text mt-1">Oct 31</p>
          <p className="text-xs text-text-tertiary mt-0.5">Disbursement in 9 days</p>
        </Card>
      </div>

      {/* Payroll Run Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Employee Payroll Breakdown ({users.length})
          </h3>
          <span className="text-xs text-text-tertiary">Calculated via ADP Payroll Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Gross Salary</th>
                <th className="px-4 py-3">Taxes & Deductions</th>
                <th className="px-4 py-3">Net Payout</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => {
                const gross = 11250;
                const deductions = 2450;
                const net = gross - deductions;

                return (
                  <tr key={u.id} className="hover:bg-primary-50/20 transition-colors h-[52px]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-text">{u.name}</p>
                          <p className="text-[11px] text-text-tertiary font-mono">#{u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-text-secondary">{u.department}</td>

                    <td className="px-4 py-3 font-mono font-bold text-text">
                      ${gross.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-[#B45309]">
                      -${deductions.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-[#15803D]">
                      ${net.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">Direct Deposit (ACH)</td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setPayslipModalUser(u)}
                        className="text-primary font-semibold hover:underline"
                      >
                        Preview →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Preview Modal */}
      <Modal
        isOpen={!!payslipModalUser}
        onClose={() => setPayslipModalUser(null)}
        title="Payslip Preview · October 2026"
        subtitle={`Official Earnings Statement for ${payslipModalUser?.name}`}
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Company:</span>
              <strong className="text-text font-sans">MHK Tech Inc. (EIN: 84-2910492)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Employee:</span>
              <span className="font-bold text-text font-sans">{payslipModalUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Pay Period:</span>
              <span>10/01/2026 – 10/31/2026</span>
            </div>
          </div>

          <div className="border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between font-bold text-text border-b border-border pb-1">
              <span>Earnings</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Regular Base Salary</span>
              <span>$11,250.00</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>FICA Social Security</span>
              <span>-$697.50</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Medicare</span>
              <span>-$163.12</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Federal Withholding Tax</span>
              <span>-$1,589.38</span>
            </div>
            <div className="flex justify-between font-bold text-[#15803D] pt-2 border-t border-border text-sm">
              <span>Net Direct Deposit Payout</span>
              <span>$8,800.00</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setPayslipModalUser(null)}
              className="h-8 px-4 rounded-btn border border-border text-xs font-sans text-text-secondary"
            >
              Close
            </button>
            <button
              onClick={() => alert('Downloading official PDF copy')}
              className="h-8 px-4 rounded-btn hero-gradient text-white text-xs font-sans font-semibold shadow-sm"
            >
              Download PDF Statement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
