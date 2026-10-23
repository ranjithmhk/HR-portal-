import React from 'react';
import {
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const AccountingReports: React.FC = () => {
  // Zoho Analytics Chart Colors: Blue #056CB8, Red #EE0014, Green #00A859, Yellow #FED600, Purple #582467
  const chartColors = ['#056CB8', '#EE0014', '#00A859', '#FED600', '#582467'];

  const agingData = [
    { label: 'Current (0-30 days)', amount: 68000, color: '#056CB8', percent: 62 },
    { label: '31-60 days', amount: 24500, color: '#EE0014', percent: 22 },
    { label: '61-90 days', amount: 18200, color: '#FFB800', percent: 16 },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Accounting', href: '/hr/overview' }, { label: 'Financial Reports' }]}
        title="Financial Statements & Accounts Aging"
        subtitle="Profit & Loss summary, accounts receivable aging schedule and cash flow benchmarks"
        actions={
          <button
            onClick={() => alert('Downloading official Q3 statutory P&L package')}
            className="h-9 px-3.5 rounded-btn border border-border bg-surface text-text hover:bg-surface-muted text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-text-tertiary" /> Export P&L PDF
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="micro-label text-text-secondary">Total Invoiced (Q3)</span>
          <p className="text-kpi text-text mt-1 font-mono">$166,200</p>
          <span className="text-xs text-[#15803D] font-bold inline-flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% YoY
          </span>
        </Card>

        <Card className="p-5">
          <span className="micro-label text-text-secondary">Gross Operating Margin</span>
          <p className="text-kpi text-[#15803D] mt-1 font-mono">68.2%</p>
          <span className="text-xs text-text-secondary mt-1 block">Benchmark: High-Growth SaaS</span>
        </Card>

        <Card className="p-5">
          <span className="micro-label text-text-secondary">Total Outstanding Receivables</span>
          <p className="text-kpi text-[#B45309] mt-1 font-mono">$42,700</p>
          <span className="text-xs text-[#B45309] font-medium mt-1 block">Average DSO: 34 days</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7/12): P&L Statement */}
        <div className="lg:col-span-7">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-heading font-bold text-sm text-text">
                Condensed Profit & Loss Statement (CY 2026 Q3)
              </h3>
              <span className="text-xs font-mono text-text-tertiary">All figures in USD</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-bold text-text py-1 border-b border-border">
                <span>Enterprise Client Delivery Revenue</span>
                <span className="font-mono">$166,200.00</span>
              </div>
              <div className="flex justify-between text-text-secondary pl-3">
                <span>Cloud Engineering Services</span>
                <span className="font-mono">$112,500.00</span>
              </div>
              <div className="flex justify-between text-text-secondary pl-3">
                <span>DevOps Automation & Security Consulting</span>
                <span className="font-mono">$53,700.00</span>
              </div>

              <div className="flex justify-between font-bold text-text py-1 border-b border-border pt-2">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="font-mono text-[#B45309]">-$52,850.00</span>
              </div>
              <div className="flex justify-between text-text-secondary pl-3">
                <span>Direct Engineering Payroll & Contractor Wages</span>
                <span className="font-mono">-$38,000.00</span>
              </div>
              <div className="flex justify-between text-text-secondary pl-3">
                <span>AWS Direct Connect & Infrastructure Hosting</span>
                <span className="font-mono">-$14,850.00</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted flex justify-between font-extrabold text-sm text-text pt-2 border-t-2 border-border">
                <span>Net Gross Operating Profit</span>
                <span className="font-mono text-[#15803D]">$113,350.00</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5/12): Aging Schedule */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-text">
              Accounts Receivable Aging Distribution
            </h3>
            <p className="text-xs text-text-secondary">
              Outstanding client receivables segmented by delinquency aging bucket
            </p>

            <div className="space-y-3 pt-2">
              {agingData.map(bucket => (
                <div key={bucket.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-text">
                    <span>{bucket.label}</span>
                    <span className="font-mono">${bucket.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${bucket.percent}%`, backgroundColor: bucket.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-surface-muted text-xs text-text-secondary space-y-1 mt-4">
              <span className="font-bold text-text block">Credit Control Summary:</span>
              <p>
                Zero bad debt provisions required this quarter. 84% of payments collected electronically via ACH.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
