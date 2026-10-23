import React, { useState } from 'react';
import {
  Lock,
  Check,
  X,
  Shield,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const Roles: React.FC = () => {
  const permissions = [
    { key: 'view_dashboard', label: 'View Personal Dashboard & Tasks' },
    { key: 'log_time', label: 'Punch In / Out & Log Timesheets' },
    { key: 'request_leaves', label: 'Apply for Leaves & View Balances' },
    { key: 'submit_expenses', label: 'Submit Expense Reimbursements' },
    { key: 'manage_directory', label: 'View Enterprise Directory & Org Chart' },
    { key: 'approve_leaves', label: 'Approve & Reject Employee Leaves' },
    { key: 'verify_docs', label: 'Verify Legal Documents & Form I-9' },
    { key: 'manage_payroll', label: 'Execute Monthly Payroll Runs' },
    { key: 'manage_lca', label: 'Monitor H1B Prevailing Wage Compliance' },
    { key: 'manage_accounting', label: 'Create AR Invoices & Settle Bills' },
    { key: 'publish_handbook', label: 'Edit & Publish Corporate Handbook Editions' },
    { key: 'sign_msa', label: 'Legal Delegation of Authority (Sign MSAs)' },
    { key: 'system_audit', label: 'Access Immutable SOC 2 Audit Logs' },
  ];

  const [matrix, setMatrix] = useState<{ [role: string]: { [perm: string]: boolean } }>({
    EMPLOYEE: {
      view_dashboard: true,
      log_time: true,
      request_leaves: true,
      submit_expenses: true,
      manage_directory: true,
      approve_leaves: false,
      verify_docs: false,
      manage_payroll: false,
      manage_lca: false,
      manage_accounting: false,
      publish_handbook: false,
      sign_msa: false,
      system_audit: false,
    },
    HR: {
      view_dashboard: true,
      log_time: true,
      request_leaves: true,
      submit_expenses: true,
      manage_directory: true,
      approve_leaves: true,
      verify_docs: true,
      manage_payroll: true,
      manage_lca: true,
      manage_accounting: true,
      publish_handbook: false,
      sign_msa: false,
      system_audit: true,
    },
    ADMIN: {
      view_dashboard: true,
      log_time: true,
      request_leaves: true,
      submit_expenses: true,
      manage_directory: true,
      approve_leaves: true,
      verify_docs: true,
      manage_payroll: true,
      manage_lca: true,
      manage_accounting: true,
      publish_handbook: true,
      sign_msa: true,
      system_audit: true,
    },
  });

  const togglePerm = (role: string, perm: string) => {
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm],
      },
    }));
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/overview' }, { label: 'Roles & Permissions' }]}
        title="Role-Based Access Control (RBAC) Matrix"
        subtitle="Configure granular platform permissions, compliance gates, and executive authority tiers"
      />

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Enterprise RBAC Entitlement Matrix
          </h3>
          <span className="text-xs text-text-tertiary">13 security capabilities evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3.5">Permission / Security Capability</th>
                <th className="px-4 py-3.5 text-center w-36">
                  <span className="font-bold text-text">EMPLOYEE</span>
                </th>
                <th className="px-4 py-3.5 text-center w-36">
                  <span className="font-bold text-primary">HR CONSOLE</span>
                </th>
                <th className="px-4 py-3.5 text-center w-36">
                  <span className="font-bold text-magenta">ADMIN CONSOLE</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {permissions.map(p => (
                <tr key={p.key} className="hover:bg-primary-50/20 transition-colors h-[50px]">
                  <td className="px-5 py-3 font-medium text-text">{p.label}</td>

                  {(['EMPLOYEE', 'HR', 'ADMIN'] as const).map(role => {
                    const isGranted = !!matrix[role][p.key];

                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        <button
                          onClick={() => togglePerm(role, p.key)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isGranted
                              ? 'bg-[#E7F6EC] text-[#15803D]'
                              : 'bg-surface-muted text-text-tertiary hover:bg-border'
                          }`}
                          title={`Toggle ${p.label} for ${role}`}
                        >
                          {isGranted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
