import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  Info,
  DollarSign,
  FileCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';

export const Compliance: React.FC = () => {
  const { users, candidates } = useStore();
  const navigate = useNavigate();

  const [excludedMap, setExcludedMap] = useState<{ [id: string]: boolean }>({});

  const toggleExclude = (id: string) => {
    setExcludedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingI9Candidates = candidates.filter(c => c.i9Section2Status === 'Pending');
  const stuckCandidates = candidates.filter(c => (c.daysStuck || 0) >= 5);

  const lcaEmployees = users.filter(u => u.lcaWage);

  const totalOwedBehind = lcaEmployees.reduce(
    (acc, curr) => (excludedMap[curr.id] ? acc : acc + (curr.lcaWage?.behindToday || 0)),
    0
  );

  const statItems: StatItem[] = [
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Work Auth Expiring (<90d)',
      value: '0 Teammates',
      delta: { text: 'All Clear · No Critical Expiries', positive: true },
    },
    {
      icon: <FileCheck className="w-4 h-4" />,
      label: 'I-9 Section 2 Pending',
      value: pendingI9Candidates.length,
      delta: { text: 'Physical ID check needed', danger: pendingI9Candidates.length > 0 },
      hasGradientAccent: true,
      onClick: () => navigate('/hr/recruit/candidates'),
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Onboarding Stuck (5+ days)',
      value: stuckCandidates.length,
      delta: { text: 'Escalate to candidate', danger: stuckCandidates.length > 0 },
      onClick: () => navigate('/hr/recruit/candidates'),
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'H1B Wage Compliance Gap',
      value: totalOwedBehind > 0 ? `$${totalOwedBehind.toLocaleString()}` : '$0',
      delta: {
        text: totalOwedBehind > 0 ? 'Remediation payroll needed' : '100% Compliant',
        danger: totalOwedBehind > 0,
        positive: totalOwedBehind === 0,
      },
    },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Compliance & Immigration' }]}
        title="Work Authorization & H1B Wage Compliance Monitor"
        subtitle="Department of Labor (DOL) LCA wage parity, USCIS I-9 verification and visa tenure audits"
      />

      {/* Stat Strip */}
      <StatStrip stats={statItems} />

      {/* 3 Grid Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Work Authorization Expiry Monitor */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="micro-label text-text-secondary">Work Auth Expiry</span>
            <span className="text-[10px] font-bold text-[#15803D]">90-Day Horizon</span>
          </div>

          <EmptyState
            icon={<CheckCircle2 className="w-6 h-6 text-[#15803D]" />}
            title="All Clear — No Expirations"
            description="All active H-1B, TN and L-1 employee visa petitions are valid for 180+ days. Next batch renewal filings begin Feb 2027."
            className="p-6 min-h-[180px]"
          />
        </Card>

        {/* 2. I-9 Section 2 Pending */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="micro-label text-text-secondary">I-9 Section 2 Pending</span>
            <span className="text-[10px] font-bold text-[#B45309]">Physical Verification</span>
          </div>

          <div className="space-y-2.5">
            {pendingI9Candidates.map(c => (
              <div key={c.id} className="p-3 rounded-lg bg-surface-muted flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-text">{c.name}</p>
                  <p className="text-[10px] text-text-tertiary">Started {c.createdDate} · {c.workLocation}</p>
                </div>
                <button
                  onClick={() => navigate('/hr/recruit/candidates')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Go to Candidates →
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Onboarding Stuck (5+ days) */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="micro-label text-text-secondary">Onboarding Stuck (5+ Days)</span>
            <span className="text-[10px] font-bold text-[#C81E3A]">Escalation</span>
          </div>

          <div className="space-y-2.5">
            {stuckCandidates.map(c => (
              <div key={c.id} className="p-3 rounded-lg bg-[#FDECEF]/60 border border-[#C81E3A]/20 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-text">{c.name}</p>
                  <p className="text-[10px] text-[#C81E3A] font-medium">Stuck {c.daysStuck} days on direct deposit</p>
                </div>
                <button
                  onClick={() => alert(`Escalation reminder sent to ${c.email}`)}
                  className="h-7 px-2.5 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-muted"
                >
                  Nudge
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* H1B Wage Compliance Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-text">
              H-1B Prevailing Wage Compliance (Form ETA-9035 LCA)
            </h3>
            <p className="text-xs text-text-secondary">
              Real-time audit comparing actual payroll year-to-date disbursements against certified prevailing wage requirements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-secondary">
              Monitored: <strong className="text-text">{lcaEmployees.length} petitions</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Employee</th>
                <th className="px-4 py-3">LCA Minimum</th>
                <th className="px-4 py-3">Earned YTD</th>
                <th className="px-4 py-3">Owed Today</th>
                <th className="px-4 py-3">Behind Today</th>
                <th className="px-4 py-3">Days Left</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Exclude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lcaEmployees.map(emp => {
                const lca = emp.lcaWage!;
                const isExcluded = !!excludedMap[emp.id];

                return (
                  <tr
                    key={emp.id}
                    className={`transition-colors h-[54px] ${
                      isExcluded
                        ? 'opacity-40 bg-surface-muted/50'
                        : lca.behindToday > 0
                        ? 'bg-[#FFF4DF]/20 hover:bg-[#FFF4DF]/40'
                        : 'hover:bg-primary-50/20'
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-text">{emp.name}</p>
                          <p className="text-[11px] text-text-tertiary">
                            #{emp.id} · {emp.jobTitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-text">
                      ${lca.lcaMinimum.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-text">
                      ${lca.earned.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-text">
                      ${lca.owedToday.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono">
                      {lca.behindToday > 0 ? (
                        <span className="font-bold text-[#B45309]">
                          -${lca.behindToday.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#15803D] font-bold">$0</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-text-secondary">
                      {lca.daysLeft} days
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={lca.status === 'Compliant' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {lca.status}
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleExclude(emp.id)}
                        className="text-xs font-medium text-text-secondary hover:text-text underline"
                      >
                        {isExcluded ? 'Include' : 'Exclude'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
