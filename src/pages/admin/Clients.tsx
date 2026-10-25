import React, { useState } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MasterDetail } from '../../components/ui/MasterDetail';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';

interface ClientItem {
  id: string;
  name: string;
  industry: string;
  msaStatus: 'Executed' | 'Review' | 'Draft';
  activeEngineers: number;
  monthlyRunRate: number;
  primaryContact: string;
  email: string;
  accountLead: string;
}

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<ClientItem[]>([
    {
      id: 'CLI-01',
      name: 'Apex Global Financial Tech LLC',
      industry: 'FinTech & Capital Markets',
      msaStatus: 'Executed',
      activeEngineers: 6,
      monthlyRunRate: 42500,
      primaryContact: 'Michael Sterling (VP Eng)',
      email: 'm.sterling@apexglobal.io',
      accountLead: 'Vikram Rao',
    },
    {
      id: 'CLI-02',
      name: 'Vanguard Health Systems',
      industry: 'Healthcare & HIPAA Compliance',
      msaStatus: 'Executed',
      activeEngineers: 8,
      monthlyRunRate: 68000,
      primaryContact: 'Dr. Evelyn Vance (Chief Data Officer)',
      email: 'evance@vanguardhealth.org',
      accountLead: 'Marcus Chen',
    },
    {
      id: 'CLI-03',
      name: 'CyberShield Logistics Corp',
      industry: 'Supply Chain & IoT Telematics',
      msaStatus: 'Executed',
      activeEngineers: 4,
      monthlyRunRate: 31200,
      primaryContact: 'Hank Bradley (Head of Infrastructure)',
      email: 'hbradley@cybershield.com',
      accountLead: 'David Kim',
    },
    {
      id: 'CLI-04',
      name: 'Zenith Retail Analytics',
      industry: 'Predictive E-Commerce ML',
      msaStatus: 'Executed',
      activeEngineers: 3,
      monthlyRunRate: 24500,
      primaryContact: 'Priya Sundaram (Product Lead)',
      email: 'psundaram@zenithretail.ai',
      accountLead: 'Priya Patel',
    },
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string | null>('CLI-01');
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/overview' }, { label: 'Client Accounts' }]}
        title="Enterprise Client Accounts & MSAs"
        subtitle="Manage master services agreements, dedicated engineering team staffing, and accounts"
      />

      <MasterDetail
        hasSelection={!!selectedClient}
        onClearSelection={() => setSelectedClientId(null)}
        title={selectedClient ? `Client File · ${selectedClient.name}` : 'Select Client'}
        master={
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
            {clients.map(client => {
              const isSelected = selectedClientId === client.id;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`p-4 cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-primary-50/50' : 'hover:bg-surface-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-text">{client.name}</span>
                    <StatusBadge variant="success" size="sm">{client.msaStatus}</StatusBadge>
                  </div>

                  <p className="text-xs text-text-secondary">{client.industry}</p>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1">
                    <span>{client.activeEngineers} Dedicated Engineers</span>
                    <span className="font-mono font-bold text-primary">
                      ${client.monthlyRunRate.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        }
        detail={
          selectedClient ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Legal Corporate Entity:</span>
                  <strong className="text-text">{selectedClient.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Industry Vertical:</span>
                  <span className="text-text">{selectedClient.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Master Services Agreement (MSA):</span>
                  <span className="text-[#15803D] font-bold">Executed & Active</span>
                </div>
              </div>

              {/* Stakeholder Info */}
              <div className="space-y-2 text-xs">
                <span className="micro-label text-text-secondary">Client Stakeholders</span>
                <div className="p-3.5 rounded-lg border border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Primary Contact:</span>
                    <strong className="text-text">{selectedClient.primaryContact}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Billing Email:</span>
                    <span className="font-mono text-primary">{selectedClient.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Internal Account Lead:</span>
                    <span className="font-semibold text-text">{selectedClient.accountLead}</span>
                  </div>
                </div>
              </div>

              {/* Staffing Allocation */}
              <div className="space-y-2 text-xs">
                <span className="micro-label text-text-secondary">Contract Staffing & Retainer</span>
                <div className="p-3.5 rounded-lg bg-surface-muted border border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Assigned Engineering Staff:</span>
                    <span className="font-bold text-text">{selectedClient.activeEngineers} Engineers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monthly Retainer Invoiced:</span>
                    <span className="font-mono font-bold text-primary text-sm">
                      ${selectedClient.monthlyRunRate.toLocaleString()} / month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
};
