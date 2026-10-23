import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  GitFork,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  User as UserIcon,
  ChevronRight,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Drawer } from '../../components/ui/Drawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { User } from '../../types';

export const Directory: React.FC = () => {
  const { users } = useStore();
  const [searchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'org'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(() => {
    const queryId = searchParams.get('selected');
    return queryId ? users.find(u => u.id === queryId) || null : null;
  });

  const departments = ['All', 'Engineering', 'Data Science', 'HR', 'IT', 'Finance', 'Executive'];

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesDept = selectedDept === 'All' || u.department === selectedDept;
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.includes(searchQuery) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [users, selectedDept, searchQuery]);

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Directory' }]}
        title={`Company Directory · ${users.length} active employees`}
        subtitle="Search and connect with colleagues across US & India development teams"
        actions={
          <div className="flex items-center p-1 rounded-lg bg-surface border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-50 text-primary shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-50 text-primary shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setViewMode('org')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'org'
                  ? 'bg-primary-50 text-primary shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
              title="Org Chart (Network Motif)"
            >
              <GitFork className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        }
      />

      {/* Search & Department Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3.5" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, department or ID..."
            className="w-full h-10 pl-9 pr-4 rounded-input border border-border bg-surface text-xs text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text hover:border-border-strong'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map(user => {
            const initials = user.name
              .split(' ')
              .map(n => n[0])
              .join('');

            return (
              <div
                key={user.id}
                onClick={() => setSelectedEmployee(user)}
                className="p-5 rounded-xl bg-surface border border-border hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-magenta text-white font-heading font-bold text-base flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      {initials}
                    </div>
                    <StatusBadge
                      variant={
                        user.role === 'ADMIN'
                          ? 'role-admin'
                          : user.role === 'HR'
                          ? 'role-hr'
                          : 'role-employee'
                      }
                      size="sm"
                    >
                      {user.role}
                    </StatusBadge>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-text group-hover:text-primary transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-0.5 line-clamp-1">
                    {user.jobTitle}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5 font-mono">#{user.id}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-1 text-[11px] text-text-secondary">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-text-tertiary shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{user.workLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-text-tertiary shrink-0" strokeWidth={1.75} />
                    <span>{user.department}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: List */}
      {viewMode === 'list' && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Role / Department</th>
                <th className="px-4 py-3.5">Work Location</th>
                <th className="px-4 py-3.5">Manager</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(user => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedEmployee(user)}
                  className="hover:bg-primary-50/20 cursor-pointer transition-colors h-[52px]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{user.name}</p>
                        <p className="text-[11px] text-text-tertiary font-mono">#{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{user.jobTitle}</p>
                    <p className="text-[11px] text-text-secondary">{user.department}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{user.workLocation}</td>
                  <td className="px-4 py-3 text-text-secondary">{user.manager}</td>
                  <td className="px-4 py-3 text-text-tertiary font-mono">{user.joiningDate}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEmployee(user);
                      }}
                      className="text-primary font-semibold hover:underline"
                    >
                      View Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: Org Chart (Pannable Horizontal Tree with Network Motif) */}
      {viewMode === 'org' && (
        <Card className="p-8 overflow-x-auto min-h-[460px] bg-gradient-to-b from-surface to-surface-muted/50">
          <div className="text-center mb-8">
            <span className="micro-label text-text-secondary">Network Topology</span>
            <h2 className="font-heading font-bold text-lg text-text mt-0.5">
              MHK Tech Inc. Reporting Hierarchy
            </h2>
            <p className="text-xs text-text-secondary">
              Nodes = employees · Spokes = reporting lines · Click any node to open profile
            </p>
          </div>

          {/* Org Tree Network */}
          <div className="flex flex-col items-center space-y-8 min-w-[700px]">
            {/* Top Node: COO & VP (Admin) */}
            <div
              onClick={() => setSelectedEmployee(users.find(u => u.id === '800001') || null)}
              className="p-4 rounded-xl bg-surface border-2 border-primary shadow-md hover:border-magenta transition-all cursor-pointer text-center w-64 group"
            >
              <div className="w-10 h-10 rounded-full bg-magenta text-white font-bold text-sm mx-auto flex items-center justify-center mb-2 shadow-sm">
                RM
              </div>
              <h4 className="font-bold text-sm text-text group-hover:text-magenta transition-colors">
                Rajesh Mirchandani
              </h4>
              <p className="text-xs text-primary font-medium">Chief Operating Officer & VP</p>
              <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-magenta-50 text-magenta">
                Executive Lead
              </span>
            </div>

            {/* Connecting Spoke */}
            <div className="w-0.5 h-8 bg-primary/40 -mt-2 -mb-2" />

            {/* Level 2: Engineering Lead & HR Lead */}
            <div className="flex items-start justify-center gap-16 relative">
              {/* Branch line */}
              <div className="absolute -top-6 left-1/4 right-1/4 h-0.5 bg-primary/40" />

              {/* Marcus Chen (Eng) */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => setSelectedEmployee(users.find(u => u.id === '800189') || null)}
                  className="p-3.5 rounded-xl bg-surface border border-border shadow-sm hover:border-magenta hover:shadow-md transition-all cursor-pointer text-center w-56 group"
                >
                  <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs mx-auto flex items-center justify-center mb-1.5">
                    MC
                  </div>
                  <h4 className="font-bold text-xs text-text group-hover:text-magenta transition-colors">
                    Marcus Chen
                  </h4>
                  <p className="text-[11px] text-text-secondary">Principal Software Engineer</p>
                  <p className="text-[10px] text-primary font-semibold mt-1">2 Direct Reports</p>
                </div>

                {/* Sub Spoke */}
                <div className="w-0.5 h-6 bg-border-strong my-1" />

                {/* Level 3 Reports of Marcus Chen */}
                <div className="flex gap-4">
                  {/* Vikram Rao */}
                  <div
                    onClick={() => setSelectedEmployee(users.find(u => u.id === '800338') || null)}
                    className="p-3 rounded-lg bg-surface border border-border hover:border-primary cursor-pointer text-center w-44 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full hero-gradient text-white font-bold text-xs mx-auto flex items-center justify-center mb-1">
                      VR
                    </div>
                    <p className="font-bold text-xs text-text">Vikram Rao (You)</p>
                    <p className="text-[10px] text-text-secondary">Senior Cloud Architect</p>
                  </div>

                  {/* Sara Jenkins */}
                  <div
                    onClick={() => setSelectedEmployee(users.find(u => u.id === '800312') || null)}
                    className="p-3 rounded-lg bg-surface border border-border hover:border-primary cursor-pointer text-center w-44 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-muted text-text font-bold text-xs mx-auto flex items-center justify-center mb-1">
                      SJ
                    </div>
                    <p className="font-bold text-xs text-text">Sara Jenkins</p>
                    <p className="text-[10px] text-text-secondary">Senior QA Automation</p>
                  </div>
                </div>
              </div>

              {/* Ananya Sharma (HR) */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => setSelectedEmployee(users.find(u => u.id === '800102') || null)}
                  className="p-3.5 rounded-xl bg-surface border border-border shadow-sm hover:border-magenta hover:shadow-md transition-all cursor-pointer text-center w-56 group"
                >
                  <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs mx-auto flex items-center justify-center mb-1.5">
                    AS
                  </div>
                  <h4 className="font-bold text-xs text-text group-hover:text-magenta transition-colors">
                    Ananya Sharma
                  </h4>
                  <p className="text-[11px] text-text-secondary">Head of People Operations</p>
                  <p className="text-[10px] text-primary font-semibold mt-1">1 Direct Report</p>
                </div>

                {/* Sub Spoke */}
                <div className="w-0.5 h-6 bg-border-strong my-1" />

                {/* Aisha Khan */}
                <div
                  onClick={() => setSelectedEmployee(users.find(u => u.id === '800420') || null)}
                  className="p-3 rounded-lg bg-surface border border-border hover:border-primary cursor-pointer text-center w-44 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-muted text-text font-bold text-xs mx-auto flex items-center justify-center mb-1">
                    AK
                  </div>
                  <p className="font-bold text-xs text-text">Aisha Khan</p>
                  <p className="text-[10px] text-text-secondary">HR Generalist</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Employee Detail Drawer */}
      <Drawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title={selectedEmployee?.name || 'Employee Profile'}
        subtitle={`Employee ID #${selectedEmployee?.id} · ${selectedEmployee?.department}`}
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-4 rounded-xl bg-surface-muted border border-border flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-magenta text-white font-heading font-extrabold text-xl flex items-center justify-center shadow-md">
                {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-text">
                  {selectedEmployee.name}
                </h3>
                <p className="text-xs text-text-secondary font-medium">
                  {selectedEmployee.jobTitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge
                    variant={
                      selectedEmployee.role === 'ADMIN'
                        ? 'role-admin'
                        : selectedEmployee.role === 'HR'
                        ? 'role-hr'
                        : 'role-employee'
                    }
                    size="sm"
                  >
                    {selectedEmployee.role}
                  </StatusBadge>
                  <span className="text-[11px] text-text-tertiary">
                    Joined: {selectedEmployee.joiningDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-3">
              <span className="micro-label text-text-secondary">Contact Information</span>
              <div className="p-4 rounded-xl bg-surface border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-text-tertiary" /> Work Email:
                  </span>
                  <a
                    href={`mailto:${selectedEmployee.email}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {selectedEmployee.email}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-secondary flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-text-tertiary" /> Phone:
                  </span>
                  <span className="text-text font-mono">{selectedEmployee.phone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-secondary flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-text-tertiary" /> Office Location:
                  </span>
                  <span className="text-text">{selectedEmployee.workLocation}</span>
                </div>
              </div>
            </div>

            {/* Work & Reporting Line */}
            <div className="space-y-3">
              <span className="micro-label text-text-secondary">Organizational Assignment</span>
              <div className="p-4 rounded-xl bg-surface border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Department:</span>
                  <span className="font-semibold text-text">{selectedEmployee.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Reports To (Manager):</span>
                  <span className="font-semibold text-primary">{selectedEmployee.manager}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Employment Status:</span>
                  <StatusBadge variant="success" size="sm">
                    {selectedEmployee.status}
                  </StatusBadge>
                </div>
              </div>
            </div>

            {/* LCA Wage Compliance Info (if applicable) */}
            {selectedEmployee.lcaWage && (
              <div className="space-y-3">
                <span className="micro-label text-text-secondary">Immigration LCA Compliance</span>
                <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">LCA Certified Minimum:</span>
                    <span className="font-mono font-semibold text-text">
                      ${selectedEmployee.lcaWage.lcaMinimum.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Status:</span>
                    <StatusBadge
                      variant={
                        selectedEmployee.lcaWage.status === 'Compliant' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {selectedEmployee.lcaWage.status}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
