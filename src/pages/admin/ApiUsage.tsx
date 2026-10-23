import React, { useState } from 'react';
import {
  Cpu,
  DollarSign,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';

export const ApiUsage: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const statItems: StatItem[] = [
    {
      icon: <Cpu className="w-4 h-4" />,
      label: 'Total API Gateway Invocations',
      value: '2.48M',
      delta: { text: '+12% vs last month', positive: true },
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'LLM & Infrastructure Spend',
      value: '$342.18',
      delta: { text: 'Well under $500 monthly cap', positive: true },
      hasGradientAccent: true,
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: '5xx Error Rate',
      value: '0.004%',
      delta: { text: '99.99% Availability SLA', positive: true },
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: 'p99 API Latency',
      value: '42ms',
      delta: { text: 'AWS us-east-1 VPC', neutral: true },
    },
  ];

  const services = [
    { name: 'MHK AI Voice Activity Transcription Engine', calls: '84,200', cost: '$68.40', latency: '320ms', status: 'Healthy' },
    { name: 'HR Document OCR & Currency Auto-Detection', calls: '12,450', cost: '$41.20', latency: '410ms', status: 'Healthy' },
    { name: 'Employee Identity & Okta SAML Authenticator', calls: '1,840,000', cost: '$120.00', latency: '28ms', status: 'Healthy' },
    { name: 'USCIS Form I-9 E-Verify Gateway API', calls: '3,800', cost: '$45.00', latency: '210ms', status: 'Healthy' },
    { name: 'Jira Cloud Two-Way Sprint Task Webhooks', calls: '542,000', cost: '$67.58', latency: '54ms', status: 'Healthy' },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/overview' }, { label: 'API Usage & Telemetry' }]}
        title="API Usage, Telemetry & Cloud Compute Costs"
        subtitle="Monitor AI token consumptions, API invocation volumes, error rates and cloud service costs"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="h-9 px-3 rounded-btn border border-border bg-surface text-xs text-text font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Current Quarter (Q4)">Current Quarter (Q4)</option>
              <option value="Year to Date">Year to Date (CY 2026)</option>
            </select>
          </div>
        }
      />

      {/* Stat Strip */}
      <StatStrip stats={statItems} />

      {/* Services Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">Service Telemetry Breakdown</h3>
          <span className="text-xs text-text-tertiary">Real-time CloudWatch metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Service Pipeline</th>
                <th className="px-4 py-3">Invocations</th>
                <th className="px-4 py-3">Incurred Cost</th>
                <th className="px-4 py-3">p95 Latency</th>
                <th className="px-4 py-3 text-right">Service Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map(s => (
                <tr key={s.name} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                  <td className="px-5 py-3 font-semibold text-text">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-text">{s.calls}</td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">{s.cost}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{s.latency}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F6EC] text-[#15803D] font-bold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                      {s.status}
                    </span>
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
