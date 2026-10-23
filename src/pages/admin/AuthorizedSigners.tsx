import React, { useState } from 'react';
import {
  Shield,
  Plus,
  RefreshCw,
  CheckCircle2,
  Lock,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { AuthorizedSigner } from '../../types';

export const AuthorizedSigners: React.FC = () => {
  const { authorizedSigners, addSigner, toggleSignerStatus } = useStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('Vice President & Managing Director');
  const [success, setSuccess] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addSigner({
      name,
      email,
      title,
      status: 'Active',
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsAddOpen(false);
      setName('');
      setEmail('');
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Console', href: '/admin/overview' }, { label: 'Authorized Signers' }]}
        title="Authorized Corporate Signers (MSAs & Legal Contracts)"
        subtitle="Manage the MHK users who have delegated legal authority to execute vendor MSAs, customer SOWs, and NDAs"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Corporate resolution registry refreshed')}
              className="p-2 rounded-btn border border-border bg-surface hover:bg-surface-muted text-text-secondary"
              title="Refresh Registry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>+ Add Authorized Signer</span>
            </button>
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            Active Delegations of Authority ({authorizedSigners.length})
          </h3>
          <span className="text-xs text-text-tertiary">Governed by Board Resolution 2026-B</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Signer Name</th>
                <th className="px-4 py-3">Corporate Email</th>
                <th className="px-4 py-3">Official Corporate Title</th>
                <th className="px-4 py-3">Delegation Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {authorizedSigners.map(signer => (
                <tr key={signer.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-magenta-50 text-magenta font-bold text-xs flex items-center justify-center">
                        {signer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{signer.name}</p>
                        <p className="text-[10px] text-text-tertiary font-mono">{signer.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-text">{signer.email}</td>

                  <td className="px-4 py-3 text-text-secondary font-medium">{signer.title}</td>

                  <td className="px-4 py-3 font-mono text-text-secondary">{signer.createdDate}</td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={signer.status === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {signer.status}
                    </StatusBadge>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleSignerStatus(signer.id)}
                        className={`h-7 px-2.5 rounded text-xs font-semibold ${
                          signer.status === 'Active'
                            ? 'border border-[#C81E3A] text-[#C81E3A] hover:bg-[#FDECEF]'
                            : 'border border-[#15803D] text-[#15803D] hover:bg-[#E7F6EC]'
                        }`}
                      >
                        {signer.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Signer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Authorized Corporate Signer"
        subtitle="Grant legal execution authority for master services agreements"
      >
        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" />
            <h4 className="font-heading font-bold text-sm text-text">Signer Authorized</h4>
            <p className="text-xs text-text-secondary">
              Added to DocuSign corporate account and legal authority delegation ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. David Thorne"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Corporate Email</label>
              <input
                type="email"
                required
                placeholder="e.g. david.thorne@mhktechinc.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Corporate Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
              >
                Authorize Signer →
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
