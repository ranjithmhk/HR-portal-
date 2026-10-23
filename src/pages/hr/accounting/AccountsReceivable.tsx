import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Drawer } from '../../../components/ui/Drawer';
import { Modal } from '../../../components/ui/Modal';
import { ARInvoice } from '../../../types';

export const AccountsReceivable: React.FC = () => {
  const { invoices, createInvoice, recordInvoicePayment } = useStore();

  const [activeTab, setActiveTab] = useState<'invoices' | 'recurring' | 'customers'>('invoices');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Overdue' | 'Paid'>('All');

  // Create Invoice Drawer State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customer, setCustomer] = useState('Apex Global Financial Tech LLC');
  const [total, setTotal] = useState<number>(35000);
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [desc, setDesc] = useState('Cloud Architecture & Sprint Delivery 21');
  const [createSuccess, setCreateSuccess] = useState(false);

  // Payment Modal State
  const [paymentInvoice, setPaymentInvoice] = useState<ARInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const filteredInvoices = invoices.filter(inv => {
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchSearch =
      inv.customer.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || total <= 0) return;

    createInvoice({
      customer,
      total,
      outstanding: total,
      dueDate,
      items: [{ description: desc, quantity: 1, rate: total, amount: total }],
    });

    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setIsCreateOpen(false);
    }, 1500);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentAmount <= 0) return;

    recordInvoicePayment(paymentInvoice.id, paymentAmount);
    setPaymentInvoice(null);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Accounting', href: '/hr/overview' }, { label: 'Accounts Receivable' }]}
        title="Accounts Receivable & Invoicing"
        subtitle="Manage customers, issue invoices, and track payments received across client contracts"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Opening Email Templates Gallery for billing notices')}
              className="h-9 px-3.5 rounded-btn border border-border bg-surface text-text hover:bg-surface-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-text-tertiary" strokeWidth={1.75} />
              <span>Email Templates</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>+ Create Invoice</span>
            </button>
          </div>
        }
        tabs={[
          { id: 'invoices', label: 'AR Invoices', count: invoices.length },
          { id: 'recurring', label: 'Recurring Invoices', count: 3 },
          { id: 'customers', label: 'Customers', count: 4 },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3.5" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by invoice # or customer..."
            className="w-full h-10 pl-9 pr-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Pending', 'Overdue', 'Paid'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={() => alert('Ledger refreshed with bank transit feed')}
            className="p-2 rounded-btn border border-border bg-surface hover:bg-surface-muted text-text-secondary"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AR Invoices Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Client Receivables Ledger ({filteredInvoices.length})
          </h3>
          <span className="text-xs text-text-tertiary">Net 30 Payment Terms</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-4 py-3">Customer Legal Name</th>
                <th className="px-4 py-3">Total Invoiced</th>
                <th className="px-4 py-3">Outstanding Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                  <td className="px-5 py-3 font-mono font-bold text-primary">{inv.id}</td>

                  <td className="px-4 py-3 font-semibold text-text">{inv.customer}</td>

                  <td className="px-4 py-3 font-mono font-bold text-text">
                    ${inv.total.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 font-mono font-bold">
                    {inv.outstanding > 0 ? (
                      <span className="text-[#B45309]">${inv.outstanding.toLocaleString()}</span>
                    ) : (
                      <span className="text-[#15803D]">$0.00</span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono whitespace-nowrap">
                    <span className="text-text-secondary">{inv.dueDate}</span>
                    {inv.isOverdue && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FDECEF] text-[#C81E3A]">
                        OVERDUE
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={
                        inv.status === 'Paid'
                          ? 'success'
                          : inv.status === 'Overdue'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {inv.status}
                    </StatusBadge>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {inv.outstanding > 0 ? (
                      <button
                        onClick={() => {
                          setPaymentInvoice(inv);
                          setPaymentAmount(inv.outstanding);
                        }}
                        className="h-7 px-3 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm"
                      >
                        Record Payment
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-[#15803D] flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fully Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Drawer */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Customer Invoice"
        subtitle="Issue an invoice with net 30 payment terms and dispatch PDF link"
      >
        {createSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
            <h4 className="font-heading font-bold text-sm text-text">Invoice Dispatched</h4>
            <p className="text-xs text-text-secondary">
              Generated and sent to accounts payable department of {customer}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Customer</label>
              <select
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Apex Global Financial Tech LLC">Apex Global Financial Tech LLC</option>
                <option value="Vanguard Health Systems">Vanguard Health Systems</option>
                <option value="CyberShield Logistics Corp">CyberShield Logistics Corp</option>
                <option value="Zenith Retail Analytics">Zenith Retail Analytics</option>
              </select>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Invoice Total (USD)</label>
              <input
                type="number"
                min="100"
                required
                value={total}
                onChange={e => setTotal(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs font-mono font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Payment Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Deliverable Scope</label>
              <textarea
                rows={3}
                required
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
              >
                Issue Invoice & Email →
              </button>
            </div>
          </form>
        )}
      </Drawer>

      {/* Record Payment Modal */}
      <Modal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        title={`Record Inbound Payment · ${paymentInvoice?.id}`}
        subtitle={`Customer: ${paymentInvoice?.customer}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Invoice Amount:</span>
              <span className="font-mono font-bold text-text">${paymentInvoice?.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Current Outstanding:</span>
              <span className="font-mono font-bold text-[#B45309]">
                ${paymentInvoice?.outstanding.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block micro-label text-text-secondary mb-1">Payment Received (USD)</label>
            <input
              type="number"
              min="1"
              max={paymentInvoice?.outstanding}
              required
              value={paymentAmount}
              onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs font-mono font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPaymentInvoice(null)}
              className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-btn bg-[#15803D] hover:bg-[#126b33] text-white text-xs font-semibold shadow-sm"
            >
              Record Payment in Ledger →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
