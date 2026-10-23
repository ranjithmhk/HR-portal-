import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  DollarSign,
  CheckCircle2,
  Clock,
  Truck,
  Download,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const AccountsPayable: React.FC = () => {
  const { bills, approveBill, payBill } = useStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const pendingBills = bills.filter(b => b.status === 'Pending Approval' || b.status === 'Approved');
  const displayedBills = activeTab === 'pending' ? pendingBills : bills;

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Accounting', href: '/hr/overview' }, { label: 'Accounts Payable' }]}
        title="Accounts Payable & Corporate Vendor Bills"
        subtitle="Review cloud infrastructure invoices, external legal counsel retainers and corporate audit fees"
        tabs={[
          { id: 'pending', label: 'Action Required', count: pendingBills.length },
          { id: 'all', label: 'All Vendor Bills', count: bills.length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">Vendor Invoices ({displayedBills.length})</h3>
          <span className="text-xs text-text-tertiary">Verified by Controller Tyler Vance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Vendor / Supplier</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor Invoice #</th>
                <th className="px-4 py-3">Amount Due</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedBills.map(bill => (
                <tr key={bill.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                  <td className="px-5 py-3 font-semibold text-text">{bill.vendor}</td>
                  <td className="px-4 py-3 text-text-secondary">{bill.category}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{bill.invoiceNumber}</td>
                  <td className="px-4 py-3 font-mono font-bold text-text">
                    ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{bill.dueDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={
                        bill.status === 'Paid'
                          ? 'success'
                          : bill.status === 'Approved'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {bill.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {bill.status === 'Pending Approval' ? (
                      <button
                        onClick={() => approveBill(bill.id)}
                        className="h-7 px-3 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm"
                      >
                        Approve Bill
                      </button>
                    ) : bill.status === 'Approved' ? (
                      <button
                        onClick={() => payBill(bill.id)}
                        className="h-7 px-3 rounded bg-[#15803D] text-white text-xs font-semibold hover:bg-[#126b33] shadow-sm"
                      >
                        Authorize & Pay
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
