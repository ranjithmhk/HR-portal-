import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Receipt,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Filter,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Drawer } from '../../components/ui/Drawer';
import { FileDropzone } from '../../components/ui/FileDropzone';
import { ExpenseClaim } from '../../types';

export const Expenses: React.FC = () => {
  const { expenses, submitExpenseClaim, currentUser } = useStore();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Approved' | 'Rejected'>('All');
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);

  // New Claim Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [category, setCategory] = useState<ExpenseClaim['category']>('Travel');
  const [date, setDate] = useState('2026-10-22');
  const [isTravel, setIsTravel] = useState(true);
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userExpenses = expenses.filter(e => e.employeeId === currentUser.id);

  const filteredExpenses = userExpenses.filter(e => {
    if (statusFilter === 'All') return true;
    return e.status === statusFilter;
  });

  const totalSubmitted = userExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalApproved = userExpenses
    .filter(e => e.status === 'Approved')
    .reduce((acc, curr) => acc + (curr.approvedAmount || curr.amount), 0);

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    submitExpenseClaim({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      description,
      amount,
      currency,
      category,
      isTravel,
      hasFlag: false,
      receiptUrl: uploadedReceipt || 'Receipt_Doc_Scanned.pdf',
    });

    setSuccess(true);
    setDescription('');
    setAmount(0);
    setTimeout(() => {
      setSuccess(false);
      setIsNewClaimOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Expenses' }]}
        title="Expense Claims & Reimbursements"
        subtitle="Submit business travel, equipment and professional certification reimbursement claims"
        actions={
          <button
            onClick={() => setIsNewClaimOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>+ New Claim</span>
          </button>
        }
      />

      {/* Filter and KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'Submitted', 'Approved', 'Rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text hover:border-border-strong'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Currency Summary */}
        <div className="flex items-center gap-4 text-xs">
          <div className="p-2 px-3 rounded-lg bg-surface border border-border">
            <span className="text-text-tertiary">Approved Claims:</span>{' '}
            <strong className="text-[#15803D] font-mono">₹{totalApproved.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            My Expense History ({filteredExpenses.length})
          </h3>
          <span className="text-xs text-text-tertiary">Auto-verified against payroll ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Claim Details</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Claimed Amount</th>
                <th className="px-4 py-3">Approved Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">
                    No expense claims found in this view.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(claim => (
                  <tr key={claim.id} className="hover:bg-primary-50/20 transition-colors h-[52px]">
                    <td className="px-5 py-3">
                      <div className="max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-text truncate">{claim.description}</span>
                          {claim.isTravel && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-50 text-primary">
                              Travel
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-tertiary font-mono">{claim.id}</span>
                        {claim.hasFlag && (
                          <div className="flex items-center gap-1 text-[10px] text-[#B45309] mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{claim.flagReason || 'Requires additional verification'}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-text-secondary">{claim.category}</td>

                    <td className="px-4 py-3 font-mono font-bold text-text">
                      {claim.currency === 'INR' ? '₹' : '$'}
                      {claim.amount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold">
                      {claim.approvedAmount !== undefined ? (
                        <span className="text-[#15803D]">
                          {claim.currency === 'INR' ? '₹' : '$'}
                          {claim.approvedAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-text-tertiary">--</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-text-secondary">{claim.date}</td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          claim.status === 'Approved'
                            ? 'success'
                            : claim.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {claim.status}
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {claim.receiptUrl && (
                        <button
                          onClick={() => alert(`Opening receipt: ${claim.receiptUrl}`)}
                          className="text-primary hover:underline font-semibold flex items-center gap-1 justify-end"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Claim Drawer */}
      <Drawer
        isOpen={isNewClaimOpen}
        onClose={() => setIsNewClaimOpen(false)}
        title="Submit New Expense Claim"
        subtitle="Reimbursement claims are verified by People Operations & Finance"
      >
        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Claim Submitted</h4>
            <p className="text-xs text-text-secondary">
              Your claim has been queued for verification by Tyler Vance (Finance).
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateClaim} className="space-y-4">
            {/* Currency Auto-detection info box */}
            <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-50/30 border border-primary-100 dark:border-primary-300/30 flex items-start gap-2.5 text-xs text-primary">
              <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="leading-relaxed">
                <strong>Auto-detection:</strong> We automatically detect the currency and itemized tax
                from your uploaded bill receipt. You can also manually adjust fields below.
              </p>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Description of Expense
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Client workshop travel hotel & meals"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Amount</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount || ''}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs font-mono font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block micro-label text-text-secondary mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="INR">INR (₹) Default</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Travel">Travel & Lodging</option>
                  <option value="Client Entertainment">Client Entertainment</option>
                  <option value="Certification">Professional Certification</option>
                  <option value="Equipment">Workstation & Equipment</option>
                  <option value="Office Supplies">Office Supplies</option>
                </select>
              </div>

              <div>
                <label className="block micro-label text-text-secondary mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Travel checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTravel"
                checked={isTravel}
                onChange={e => setIsTravel(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <label htmlFor="isTravel" className="text-xs text-text cursor-pointer">
                Tag as Official Business Travel
              </label>
            </div>

            {/* File Dropzone */}
            <div>
              <label className="block micro-label text-text-secondary mb-1.5">
                Upload Bill Receipt (PDF / PNG / JPG, max 20 MB)
              </label>
              <FileDropzone
                onFileSelect={file => setUploadedReceipt(file.name)}
                label="Click or drop your invoice / receipt here"
                subtext="PDF, JPG, PNG up to 20 MB"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsNewClaimOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={amount <= 0 || !description.trim()}
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm disabled:opacity-40"
              >
                Submit Claim →
              </button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
};
