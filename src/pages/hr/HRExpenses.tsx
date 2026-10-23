import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ExpenseClaim } from '../../types';

export const HRExpenses: React.FC = () => {
  const { expenses, approveExpense, rejectExpense } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [actionClaim, setActionClaim] = useState<ExpenseClaim | null>(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState<number>(0);
  const [rejectReason, setRejectReason] = useState('');

  const pendingClaims = expenses.filter(e => e.status === 'Submitted');
  const displayedClaims = activeTab === 'pending' ? pendingClaims : expenses;

  const handleApprove = (claim: ExpenseClaim) => {
    approveExpense(claim.id, approvedAmountInput || claim.amount);
    setActionClaim(null);
  };

  const handleReject = (claim: ExpenseClaim) => {
    rejectExpense(claim.id, rejectReason || 'Exceeds authorized departmental per diem policy');
    setActionClaim(null);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Expense Approvals' }]}
        title="Expense Claims Review Queue"
        subtitle="Audit employee reimbursement claims, verify tax invoices and authorize disbursements"
        tabs={[
          { id: 'pending', label: 'Pending Review', count: pendingClaims.length },
          { id: 'all', label: 'All Historical Claims', count: expenses.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Reimbursement Claims Queue ({displayedClaims.length})
          </h3>
          <span className="text-xs text-text-tertiary">Verified against GSA per diem allowances</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Employee</th>
                <th className="px-4 py-3">Description / Claim</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedClaims.map(claim => (
                <tr key={claim.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                  <td className="px-5 py-3 font-semibold text-text">{claim.employeeName}</td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-text max-w-xs truncate">{claim.description}</p>
                    <span className="text-[10px] text-text-tertiary font-mono">{claim.id} · {claim.date}</span>
                    {claim.hasFlag && (
                      <p className="text-[10px] text-[#B45309] font-medium flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3" /> {claim.flagReason}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-text-secondary">{claim.category}</td>

                  <td className="px-4 py-3 font-mono font-bold text-text">
                    {claim.currency === 'INR' ? '₹' : '$'}
                    {claim.amount.toLocaleString()}
                  </td>

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

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {claim.status === 'Submitted' ? (
                      <button
                        onClick={() => {
                          setActionClaim(claim);
                          setApprovedAmountInput(claim.amount);
                        }}
                        className="h-7 px-3 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm"
                      >
                        Review Claim
                      </button>
                    ) : (
                      <span className="text-[11px] text-text-tertiary">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!actionClaim}
        onClose={() => setActionClaim(null)}
        title={`Audit Expense Claim · ${actionClaim?.id}`}
        subtitle={`Submitted by ${actionClaim?.employeeName} for ${actionClaim?.category}`}
      >
        {actionClaim && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Description:</span>
                <span className="font-bold text-text truncate max-w-xs">{actionClaim.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Original Amount Claimed:</span>
                <span className="font-mono font-bold text-text">
                  {actionClaim.currency === 'INR' ? '₹' : '$'}
                  {actionClaim.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Date Incurred:</span>
                <span className="font-mono">{actionClaim.date}</span>
              </div>
            </div>

            {/* Approved Amount Input */}
            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Approved Reimbursement Amount
              </label>
              <input
                type="number"
                min="0"
                value={approvedAmountInput}
                onChange={e => setApprovedAmountInput(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface font-mono font-bold text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Rejection / Note Input */}
            <div>
              <label className="block micro-label text-text-secondary mb-1">
                Policy Flag / Adjustment Explanation (If Rejecting or modifying)
              </label>
              <input
                type="text"
                placeholder="Optional explanation for adjustment or rejection..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => handleReject(actionClaim)}
                className="h-9 px-4 rounded-btn border border-[#C81E3A] text-[#C81E3A] hover:bg-[#FDECEF] text-xs font-semibold"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleApprove(actionClaim)}
                className="h-9 px-5 rounded-btn bg-[#15803D] hover:bg-[#126b33] text-white text-xs font-semibold shadow-sm"
              >
                Authorize Payment ({actionClaim.currency === 'INR' ? '₹' : '$'}{approvedAmountInput.toLocaleString()}) →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
