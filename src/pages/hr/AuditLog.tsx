import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  Calendar,
  Filter,
  User,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'Success' | 'Flagged' | 'Warning';
}

export const AuditLog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const events: AuditEvent[] = [
    {
      id: 'AUD-91024',
      timestamp: '2026-10-22 13:18:04',
      actor: 'Vikram Rao (Senior Cloud Architect)',
      action: 'Clocked In (Attendance)',
      target: 'Attendance Record #att-22',
      ipAddress: '198.51.100.44 (Dallas TX)',
      status: 'Success',
    },
    {
      id: 'AUD-91019',
      timestamp: '2026-10-22 12:44:19',
      actor: 'Ananya Sharma (Head of HR)',
      action: 'Approved Leave Request',
      target: 'Leave Request #LR-1082 (Vikram Rao)',
      ipAddress: '198.51.100.12 (Dallas TX)',
      status: 'Success',
    },
    {
      id: 'AUD-90998',
      timestamp: '2026-10-21 16:30:11',
      actor: 'System Admin (Rajesh Mirchandani)',
      action: 'Modified Policy Document',
      target: 'Handbook Section 2.1 (Hours)',
      ipAddress: '198.51.100.01 (HQ Internal)',
      status: 'Success',
    },
    {
      id: 'AUD-90945',
      timestamp: '2026-10-20 09:52:00',
      actor: 'System Engine (Automated Punch Rule)',
      action: 'Flagged Late Arrival',
      target: 'Vikram Rao (09:52 AM punch)',
      ipAddress: '10.0.4.12 (Internal AWS)',
      status: 'Warning',
    },
    {
      id: 'AUD-90881',
      timestamp: '2026-10-18 14:15:33',
      actor: 'Tyler Vance (Finance Manager)',
      action: 'Disbursed Expense Claim',
      target: 'Expense Claim #EXP-8821 ($300)',
      ipAddress: '198.51.100.77 (New York NY)',
      status: 'Success',
    },
    {
      id: 'AUD-90799',
      timestamp: '2026-10-15 11:22:45',
      actor: 'Deloitte SOC2 External Auditor',
      action: 'Exported IAM Access Logs',
      target: 'Q3 SOC 2 Audit Bundle',
      ipAddress: '12.189.44.102 (Auditor VPN)',
      status: 'Success',
    },
  ];

  const filtered = events.filter(e => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.actor.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.target.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Audit Log' }]}
        title="Security & System Audit Log"
        subtitle="Immutable SOC 2 Type II audit trail of user access, policy edits, and administrative authorizations"
        actions={
          <button
            onClick={() => alert('Exporting sanitized SOC 2 CSV audit log')}
            className="h-9 px-3.5 rounded-btn border border-border bg-surface text-text hover:bg-surface-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-text-tertiary" /> Export SOC 2 Log
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3.5" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, actors, or targets..."
            className="w-full h-10 pl-9 pr-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">Event Log Stream ({filtered.length})</h3>
          <span className="text-xs text-text-tertiary">Cryptographically chained</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Timestamp / Event ID</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action Description</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(evt => (
                <tr key={evt.id} className="hover:bg-primary-50/20 transition-colors h-[52px]">
                  <td className="px-5 py-3">
                    <span className="font-mono text-text font-medium">{evt.timestamp}</span>
                    <span className="block text-[10px] text-text-tertiary font-mono">{evt.id}</span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-text">{evt.actor}</td>

                  <td className="px-4 py-3 text-primary font-medium">{evt.action}</td>

                  <td className="px-4 py-3 text-text-secondary">{evt.target}</td>

                  <td className="px-4 py-3 font-mono text-[11px] text-text-tertiary">{evt.ipAddress}</td>

                  <td className="px-4 py-3 text-right">
                    <StatusBadge
                      variant={evt.status === 'Success' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {evt.status}
                    </StatusBadge>
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
