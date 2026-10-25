import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MasterDetail } from '../../../components/ui/MasterDetail';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Drawer } from '../../../components/ui/Drawer';
import { Vendor } from '../../../types';

export const Vendors: React.FC = () => {
  const { vendors, addVendor } = useStore();

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>('VND-101');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Vendor Form
  const [name, setName] = useState('');
  const [service, setService] = useState('Enterprise Software & Licensing');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [success, setSuccess] = useState(false);

  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addVendor({
      name,
      service,
      contactPerson,
      email,
      phone,
      paymentTerms,
      status: 'Active',
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsAddOpen(false);
      setName('');
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Accounting', href: '/hr/overview' }, { label: 'Vendors & Suppliers' }]}
        title="Vendor Directory & Supplier Contracts"
        subtitle="Manage approved cloud providers, legal immigration counsel, and hardware suppliers"
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>+ Add Vendor</span>
          </button>
        }
      />

      <MasterDetail
        hasSelection={!!selectedVendor}
        onClearSelection={() => setSelectedVendorId(null)}
        title={selectedVendor ? `Supplier File · ${selectedVendor.name}` : 'Select Vendor'}
        master={
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm divide-y divide-border">
            {vendors.map(v => {
              const isSelected = selectedVendorId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVendorId(v.id)}
                  className={`p-4 cursor-pointer transition-colors space-y-2 ${
                    isSelected ? 'bg-primary-50/50' : 'hover:bg-surface-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text">{v.name}</span>
                    <StatusBadge
                      variant={v.status === 'Active' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {v.status}
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-1">{v.service}</p>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1">
                    <span className="font-mono">{v.id}</span>
                    <span className="font-mono font-bold text-text">
                      ${v.totalBilled.toLocaleString()} Billed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        }
        detail={
          selectedVendor ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Vendor Legal Name:</span>
                  <span className="font-bold text-text">{selectedVendor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Primary Service:</span>
                  <span className="text-text">{selectedVendor.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Contract Status:</span>
                  <StatusBadge variant={selectedVendor.status === 'Active' ? 'success' : 'warning'} size="sm">
                    {selectedVendor.status}
                  </StatusBadge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 text-xs">
                <span className="micro-label text-text-secondary">Account Representatives</span>
                <div className="p-3.5 rounded-lg border border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Contact Person:</span>
                    <strong className="text-text">{selectedVendor.contactPerson}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Accounts Email:</span>
                    <span className="font-mono text-primary">{selectedVendor.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phone:</span>
                    <span className="font-mono text-text">{selectedVendor.phone}</span>
                  </div>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="space-y-2 text-xs">
                <span className="micro-label text-text-secondary">Commercial Terms</span>
                <div className="p-3.5 rounded-lg bg-surface-muted border border-border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Standard Payment Terms:</span>
                    <span className="font-bold text-text">{selectedVendor.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Cumulative Lifetime Spend:</span>
                    <span className="font-mono font-bold text-primary">
                      ${selectedVendor.totalBilled.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        }
      />

      {/* Add Vendor Drawer */}
      <Drawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enroll New Vendor"
        subtitle="Onboard a new supplier to the procurement master registry"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          <div>
            <label className="block micro-label text-text-secondary mb-1">Company Legal Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Cisco Systems Inc."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block micro-label text-text-secondary mb-1">Service Category</label>
            <input
              type="text"
              required
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Contact Person</label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block micro-label text-text-secondary mb-1">Billing Email</label>
              <input
                type="email"
                required
                placeholder="billing@vendor.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+1 (800) 555-0199"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block micro-label text-text-secondary mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
            >
              Enroll Vendor →
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
