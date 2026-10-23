import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Send,
  Eye,
  CheckCircle2,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Drawer } from '../../components/ui/Drawer';
import { Stepper, StepItem } from '../../components/ui/Stepper';
import { User } from '../../types';

export const Employees: React.FC = () => {
  const { users, addUser, removeUser } = useStore();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);

  // Add Employee Wizard Drawer
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'HR' | 'ADMIN'>('EMPLOYEE');
  const [jobTitle, setJobTitle] = useState('Senior Cloud Engineer');
  const [department, setDepartment] = useState<User['department']>('Engineering');
  const [manager, setManager] = useState('Marcus Chen');
  const [workLocation, setWorkLocation] = useState('Dallas, TX (US)');
  const [phone, setPhone] = useState('+1 (469) 555-0144');
  const [addSuccess, setAddSuccess] = useState(false);

  const wizardSteps: StepItem[] = [
    { id: 0, title: 'Identity', subtitle: 'Name & email' },
    { id: 1, title: 'Assignment', subtitle: 'Role & team' },
    { id: 2, title: 'Review', subtitle: 'Confirm & save' },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRole = selectedRole === 'All' || u.role === selectedRole;
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.includes(search) ||
        u.jobTitle.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [users, selectedRole, search]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name,
      email,
      role,
      jobTitle,
      department,
      manager,
      workLocation,
      phone,
    });

    setAddSuccess(true);
    setTimeout(() => {
      setAddSuccess(false);
      setIsAddOpen(false);
      setWizardStep(0);
      setName('');
      setEmail('');
    }, 1500);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: u => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-magenta text-white font-bold text-xs flex items-center justify-center shrink-0">
            {u.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-text">{u.name}</p>
            <p className="text-[11px] text-text-tertiary">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Employee ID',
      sortable: true,
      render: u => <span className="font-mono text-xs font-bold text-text">#{u.id}</span>,
    },
    {
      key: 'department',
      header: 'Department / Title',
      sortable: true,
      render: u => (
        <div>
          <span className="font-medium text-text">{u.jobTitle}</span>
          <span className="block text-[11px] text-text-secondary">{u.department}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: u => (
        <StatusBadge
          variant={
            u.role === 'ADMIN'
              ? 'role-admin'
              : u.role === 'HR'
              ? 'role-hr'
              : 'role-employee'
          }
          size="sm"
        >
          {u.role}
        </StatusBadge>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joined Date',
      sortable: true,
      render: u => <span className="font-mono text-xs text-text-secondary">{u.joiningDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: u => <StatusBadge variant="success" size="sm">{u.status}</StatusBadge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: u => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setSelectedProfile(u)}
            className="p-1.5 text-text-secondary hover:text-primary rounded hover:bg-surface-muted"
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert(`Doc upload link dispatched to ${u.email}`)}
            className="p-1.5 text-text-secondary hover:text-primary rounded hover:bg-surface-muted"
            title="Send Doc Link"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove employee ${u.name}?`)) removeUser(u.id);
            }}
            className="p-1.5 text-text-secondary hover:text-[#C81E3A] rounded hover:bg-[#FDECEF]"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Employees' }]}
        title="Employee Directory & Workforce Management"
        subtitle={`Total headcount: ${users.length} active global professionals · Filter, provision, and audit`}
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            <span>+ Add Employee</span>
          </button>
        }
      />

      {/* Filter and Bulk Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3.5" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, role, ID, or email..."
            className="w-full h-10 pl-9 pr-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5">
          {['All', 'EMPLOYEE', 'HR', 'ADMIN'].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedRole === r
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Reusable DataTable with 52px rows, hairline dividers, bulk select bar */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={u => u.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={u => setSelectedProfile(u)}
        bulkActions={ids => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Sending document re-verification request to ${ids.length} employees`)}
              className="h-7 px-2.5 rounded bg-surface border border-border text-primary hover:bg-surface-muted text-xs font-semibold"
            >
              Send Doc Reminders
            </button>
            <button
              onClick={() => alert(`Exporting audit report for ${ids.length} records`)}
              className="h-7 px-2.5 rounded bg-surface border border-border text-text hover:bg-surface-muted text-xs font-semibold"
            >
              Export CSV
            </button>
          </div>
        )}
      />

      {/* Add Employee Drawer Wizard */}
      <Drawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Employee"
        subtitle="Provision user credentials, assign reporting line & legal entity"
      >
        <div className="space-y-6">
          <Stepper
            steps={wizardSteps}
            currentStep={wizardStep}
            onStepClick={setWizardStep}
          />

          {addSuccess ? (
            <div className="py-8 text-center space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" strokeWidth={2} />
              <h4 className="font-heading font-bold text-sm text-text">Employee Created</h4>
              <p className="text-xs text-text-secondary">
                Credentials dispatched to {email}. Employee ID auto-generated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {wizardStep === 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arjun Kapoor"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Company Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arjun.k@mhktechinc.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={!name.trim() || !email.trim()}
                      onClick={() => setWizardStep(1)}
                      className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm disabled:opacity-40"
                    >
                      Next: Assignment →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block micro-label text-text-secondary mb-1">Role / Persona</label>
                      <select
                        value={role}
                        onChange={e => setRole(e.target.value as any)}
                        className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="EMPLOYEE">Employee (Standard)</option>
                        <option value="HR">HR Manager</option>
                        <option value="ADMIN">System Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block micro-label text-text-secondary mb-1">Department</label>
                      <select
                        value={department}
                        onChange={e => setDepartment(e.target.value as any)}
                        className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Data Science">Data Science</option>
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block micro-label text-text-secondary mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block micro-label text-text-secondary mb-1">Reports To</label>
                      <input
                        type="text"
                        value={manager}
                        onChange={e => setManager(e.target.value)}
                        className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block micro-label text-text-secondary mb-1">Work Location</label>
                      <select
                        value={workLocation}
                        onChange={e => setWorkLocation(e.target.value)}
                        className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Dallas, TX (US)">Dallas, TX (US)</option>
                        <option value="Austin, TX (US)">Austin, TX (US)</option>
                        <option value="Hyderabad, TS (IN)">Hyderabad, TS (IN)</option>
                        <option value="Chicago, IL (US)">Chicago, IL (US)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(0)}
                      className="h-9 px-3 rounded-btn border border-border text-xs text-text-secondary"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                    >
                      Next: Review →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-surface-muted border border-border text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Name:</span>
                      <strong className="text-text">{name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Email:</span>
                      <span className="font-mono text-text">{email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Assigned Persona:</span>
                      <StatusBadge variant="role-employee" size="sm">{role}</StatusBadge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Role / Department:</span>
                      <span className="font-semibold text-text">{jobTitle} ({department})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Work Location:</span>
                      <span>{workLocation}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="h-9 px-3 rounded-btn border border-border text-xs text-text-secondary"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                    >
                      Provision & Enroll Employee →
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </Drawer>

      {/* Full Employee Profile Drawer */}
      <Drawer
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title={selectedProfile?.name || 'Employee Profile'}
        subtitle={`ID #${selectedProfile?.id} · ${selectedProfile?.jobTitle}`}
      >
        {selectedProfile && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-surface-muted flex items-center gap-4 border border-border">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-magenta text-white font-heading font-extrabold text-xl flex items-center justify-center">
                {selectedProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-base text-text">{selectedProfile.name}</h3>
                <p className="text-xs text-text-secondary">{selectedProfile.jobTitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge variant="role-employee" size="sm">{selectedProfile.role}</StatusBadge>
                  <span className="text-[11px] text-text-tertiary">Joined {selectedProfile.joiningDate}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Email:</span>
                <span className="font-mono text-primary font-medium">{selectedProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Phone:</span>
                <span className="font-mono text-text">{selectedProfile.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Department:</span>
                <span className="font-semibold text-text">{selectedProfile.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Manager:</span>
                <span className="font-semibold text-primary">{selectedProfile.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Work Location:</span>
                <span>{selectedProfile.workLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Emergency Contact:</span>
                <span className={selectedProfile.emergencyContactsComplete ? 'text-[#15803D] font-semibold' : 'text-[#B45309]'}>
                  {selectedProfile.emergencyContactsComplete ? 'Complete (Verified)' : 'Incomplete'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
