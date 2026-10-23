import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building,
  Check,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';

interface StatementItem {
  id: string;
  date: string;
  desc: string;
  amount: number;
  type: 'Credit' | 'Debit';
  matched: boolean;
}

interface LedgerItem {
  id: string;
  date: string;
  account: string;
  amount: number;
  type: 'Credit' | 'Debit';
  matched: boolean;
}

export const Reconciliation: React.FC = () => {
  const [bankItems, setBankItems] = useState<StatementItem[]>([
    { id: 'BNK-101', date: '2026-10-21', desc: 'ACH Credit Apex Global Tech', amount: 24300, type: 'Credit', matched: true },
    { id: 'BNK-102', date: '2026-10-20', desc: 'ACH Debit AWS Cloud Infrastructure', amount: 14850.25, type: 'Debit', matched: true },
    { id: 'BNK-103', date: '2026-10-18', desc: 'Wire In Vanguard Health Systems', amount: 34000, type: 'Credit', matched: false },
    { id: 'BNK-104', date: '2026-10-15', desc: 'Deloitte Audit Fee Debit', amount: 22000, type: 'Debit', matched: true },
  ]);

  const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>([
    { id: 'LED-881', date: '2026-10-21', account: 'AR Inbound #INV-2026-079', amount: 24300, type: 'Credit', matched: true },
    { id: 'LED-882', date: '2026-10-20', account: 'AP Cloud Bill #AWS-9982410', amount: 14850.25, type: 'Debit', matched: true },
    { id: 'LED-883', date: '2026-10-18', account: 'AR Advance Deposit Vanguard', amount: 34000, type: 'Credit', matched: false },
    { id: 'LED-884', date: '2026-10-15', account: 'AP Auditor Retainer Deloitte', amount: 22000, type: 'Debit', matched: true },
  ]);

  const [matchedSuccess, setMatchedSuccess] = useState(false);

  const handleMatchPending = () => {
    setBankItems(prev => prev.map(b => ({ ...b, matched: true })));
    setLedgerItems(prev => prev.map(l => ({ ...l, matched: true })));
    setMatchedSuccess(true);
    setTimeout(() => setMatchedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Accounting', href: '/hr/overview' }, { label: 'Bank Reconciliation' }]}
        title="Bank Statement vs Ledger Reconciliation"
        subtitle="Two-pane matching between Chase Commercial checking feed and internal ERP general ledger"
        actions={
          <button
            onClick={handleMatchPending}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95"
          >
            Auto-Match Remaining (1 Item) →
          </button>
        }
      />

      {matchedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>General ledger 100% reconciled against Chase bank statement!</span>
        </div>
      )}

      {/* Two-Pane Matching Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane: Bank Statement Feed */}
        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-text">Chase Bank Transit Feed</h3>
              <p className="text-[11px] text-text-secondary">Commercial Account #•••• 9102</p>
            </div>
            <StatusBadge variant="success" size="sm">Live Feed Connected</StatusBadge>
          </div>

          <div className="divide-y divide-border">
            {bankItems.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-text">{item.desc}</p>
                  <p className="text-[11px] text-text-tertiary font-mono">{item.id} · {item.date}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold block ${
                      item.type === 'Credit' ? 'text-[#15803D]' : 'text-[#C81E3A]'
                    }`}
                  >
                    {item.type === 'Credit' ? '+' : '-'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      item.matched ? 'text-[#15803D]' : 'text-[#B45309]'
                    }`}
                  >
                    {item.matched ? '✓ Reconciled' : 'Unmatched'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Pane: General Ledger Entries */}
        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-text">General Ledger (ERP)</h3>
              <p className="text-[11px] text-text-secondary">Accounts 1010 Operating Cash</p>
            </div>
            <StatusBadge variant="info" size="sm">Ledger v4.2</StatusBadge>
          </div>

          <div className="divide-y divide-border">
            {ledgerItems.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-text">{item.account}</p>
                  <p className="text-[11px] text-text-tertiary font-mono">{item.id} · {item.date}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold block ${
                      item.type === 'Credit' ? 'text-[#15803D]' : 'text-[#C81E3A]'
                    }`}
                  >
                    {item.type === 'Credit' ? '+' : '-'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      item.matched ? 'text-[#15803D]' : 'text-[#B45309]'
                    }`}
                  >
                    {item.matched ? '✓ Matched' : 'Needs Match'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
