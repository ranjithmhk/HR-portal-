import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Phone,
  CreditCard,
  FileText,
  Shield,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Check,
  Lock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const MyProfile: React.FC = () => {
  const { currentUser, currentRole, switchRole } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'emergency' | 'bank' | 'docs' | 'security'>('personal');

  // Editable Form fields
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState('7820 Collin McKinney Pkwy, McKinney, TX 75070');
  const [emergencyName, setEmergencyName] = useState(currentUser.emergencyContact?.name || 'Sunita Rao');
  const [emergencyRel, setEmergencyRel] = useState(currentUser.emergencyContact?.relationship || 'Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.emergencyContact?.phone || '+1 (469) 555-0198');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const completionPercentage = 85;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const navItems = [
    { id: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
    { id: 'employment', label: 'Employment & Role', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Contacts', icon: <Phone className="w-4 h-4" /> },
    { id: 'bank', label: 'Bank & Tax (W-4 / Direct Deposit)', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'docs', label: 'Verified ID Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'security', label: 'MFA & Security Credentials', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'My Profile' }]}
        title="Employee Profile & Credentials"
        subtitle="Manage official employee identity, compensation routing, emergency contacts and verification"
      />

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E7F6EC] text-[#15803D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
          <span>Profile changes successfully saved and synced to People Operations vault!</span>
        </div>
      )}

      {/* Top Banner with Profile Photo & Completion Meter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-magenta text-white font-heading font-extrabold text-2xl flex items-center justify-center shadow-md">
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-lg text-text">{currentUser.name}</h2>
                <StatusBadge variant="role-employee" size="sm">
                  {currentUser.role}
                </StatusBadge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {currentUser.jobTitle} · {currentUser.department}
              </p>
              <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
                ID #{currentUser.id} · Joined {currentUser.joiningDate}
              </p>
            </div>
          </div>

          {/* Profile Completion Meter with Gradient Fill */}
          <div className="p-4 rounded-xl bg-surface-muted border border-border min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text">Profile Completion</span>
              <span className="font-bold text-primary font-mono">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden border border-border">
              <div
                className="h-full hero-gradient rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-text-tertiary">
              Complete secondary emergency contact to reach 100%
            </p>
          </div>
        </div>
      </Card>

      {/* Main Grid: Vertical Tab Rail (4/12) + Content (8/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Vertical Tab Rail */}
        <aside className="lg:col-span-4 space-y-2">
          <Card className="p-2 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full px-3.5 py-3 rounded-lg text-xs font-semibold text-left flex items-center gap-3 transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary shadow-sm font-bold'
                    : 'text-text-secondary hover:bg-surface-muted hover:text-text'
                }`}
              >
                <span className={activeTab === item.id ? 'text-primary' : 'text-text-tertiary'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </Card>
        </aside>

        {/* Right Form Content */}
        <div className="lg:col-span-8">
          <Card className="p-6 space-y-6">
            {/* PERSONAL INFO */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSave} className="space-y-4 animate-fadeIn">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-heading font-bold text-base text-text">Personal Details</h3>
                  <p className="text-xs text-text-secondary">Official employee identity information</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface-muted text-xs text-text-secondary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Corporate Email</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface-muted text-xs text-text-secondary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Primary Work Location</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.workLocation}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface-muted text-xs text-text-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block micro-label text-text-secondary mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                  >
                    Save Changes →
                  </button>
                </div>
              </form>
            )}

            {/* EMPLOYMENT DETAILS */}
            {activeTab === 'employment' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-heading font-bold text-base text-text">Employment Record</h3>
                  <p className="text-xs text-text-secondary">Role, managerial reporting lines, and tenure</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-surface-muted">
                    <span className="text-text-tertiary block">Designation</span>
                    <span className="font-bold text-text mt-0.5 block">{currentUser.jobTitle}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-muted">
                    <span className="text-text-tertiary block">Department</span>
                    <span className="font-bold text-text mt-0.5 block">{currentUser.department}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-muted">
                    <span className="text-text-tertiary block">Direct Reporting Manager</span>
                    <span className="font-bold text-primary mt-0.5 block">{currentUser.manager}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-muted">
                    <span className="text-text-tertiary block">Joining Date</span>
                    <span className="font-mono font-bold text-text mt-0.5 block">{currentUser.joiningDate}</span>
                  </div>
                </div>

                {/* Workspace Permissions & Role Management */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-text">Workspace Privileges</h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {currentUser.role === 'ADMIN'
                          ? 'Enterprise Administrator · Full access to Admin, HR, and Employee consoles'
                          : currentUser.role === 'HR'
                          ? 'People Operations Lead · Access to HR and Employee consoles'
                          : 'Standard Member · Standard employee permissions'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary-50 text-primary uppercase">
                      {currentUser.role}
                    </span>
                  </div>

                  {/* Multi-role consoles for Admin and HR */}
                  {currentUser.role === 'ADMIN' || currentUser.role === 'HR' ? (
                    <div className="p-3 rounded-xl bg-surface-muted border border-border space-y-2">
                      <span className="micro-label text-text-tertiary">Quick Switch Console</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            switchRole('EMPLOYEE');
                            navigate('/employee/home');
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                            currentRole === 'EMPLOYEE'
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'border-border bg-surface hover:bg-surface-muted text-text'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Employee Workspace</span>
                          {currentRole === 'EMPLOYEE' && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            switchRole('HR');
                            navigate('/hr/overview');
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                            currentRole === 'HR'
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'border-border bg-surface hover:bg-surface-muted text-text'
                          }`}
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>HR Console</span>
                          {currentRole === 'HR' && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                        </button>

                        {currentUser.role === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => {
                              switchRole('ADMIN');
                              navigate('/admin/overview');
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                              currentRole === 'ADMIN'
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'border-border bg-surface hover:bg-surface-muted text-text'
                            }`}
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Admin Console</span>
                            {currentRole === 'ADMIN' && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-surface-muted border border-border/80 flex items-center gap-2.5 text-xs text-text-secondary">
                      <Lock className="w-4 h-4 text-text-tertiary shrink-0" strokeWidth={1.75} />
                      <span>
                        Administrative & HR consoles are restricted. Access requires authorization from people operations.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EMERGENCY CONTACTS */}
            {activeTab === 'emergency' && (
              <form onSubmit={handleSave} className="space-y-4 animate-fadeIn">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-heading font-bold text-base text-text">Emergency Contacts</h3>
                  <p className="text-xs text-text-secondary">Primary and secondary emergency reach out contacts</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Contact Name</label>
                    <input
                      type="text"
                      required
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Relationship</label>
                    <input
                      type="text"
                      required
                      value={emergencyRel}
                      onChange={e => setEmergencyRel(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                  >
                    Save Emergency Contacts →
                  </button>
                </div>
              </form>
            )}

            {/* BANK & TAX */}
            {activeTab === 'bank' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-heading font-bold text-base text-text">Direct Deposit & Tax</h3>
                  <p className="text-xs text-text-secondary">Payroll disbursement routing & federal tax tier</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Routing Transit Number (ABA):</span>
                    <span className="font-mono font-bold text-text">••••• 4892 (Chase Bank NA)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Checking Account:</span>
                    <span className="font-mono font-bold text-text">•••••••• 9102</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Federal Form W-4 Tier:</span>
                    <span className="font-semibold text-text">Married Filing Jointly · 1 Dependent</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY & MFA */}
            {activeTab === 'security' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-heading font-bold text-base text-text">Security & Credentials</h3>
                  <p className="text-xs text-text-secondary">Multi-factor authentication (MFA) and access sessions</p>
                </div>

                <div className="p-4 rounded-xl bg-[#E7F6EC] text-[#15803D] flex items-center justify-between text-xs font-semibold">
                  <span>✓ Okta FIDO2 / Hardware MFA Enforced</span>
                  <StatusBadge variant="success" size="sm">Active</StatusBadge>
                </div>
              </div>
            )}

            {/* VERIFIED DOCS */}
            {activeTab === 'docs' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-heading font-bold text-base text-text">Verified Legal Documents</h3>
                  <p className="text-xs text-text-secondary">Passport, Form I-9, and NDA agreements on file</p>
                </div>
                <p className="text-xs text-text-secondary">
                  Please visit <strong>Finance & Docs → Documents</strong> to download signed PDF copies.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
