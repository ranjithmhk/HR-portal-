import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Shield,
  Briefcase,
  LogOut,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NetworkLogoIcon } from './NetworkMotif';
import { MHKLogo } from './MHKLogo';
import { Role } from '../../types';

export const TopHeader: React.FC = () => {
  const {
    currentUser,
    currentRole,
    switchRole,
    setCommandPaletteOpen,
    isDarkMode,
    toggleDarkMode,
    tasks,
    supportRequests,
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const pendingRequestsCount = supportRequests.filter(r => r.status === 'Pending HR' || r.status === 'Awaiting Your Reply').length;
  const totalOrangeBadge = pendingTasksCount + pendingRequestsCount;

  const handleRoleSwitch = (role: Role) => {
    switchRole(role);
    if (role === 'EMPLOYEE') {
      navigate('/employee/home');
    } else if (role === 'HR') {
      navigate('/hr/overview');
    } else {
      navigate('/admin/overview');
    }
    setAvatarOpen(false);
  };

  return (
    <header className="h-16 w-full bg-surface text-text px-4 lg:px-8 flex items-center justify-between border-b border-border relative z-50 select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)] font-sans">
      {/* Left: Brand Logo & Wordmark */}
      <MHKLogo
        variant="header"
        size="md"
        badgeText={currentRole === 'EMPLOYEE' ? 'Portal' : currentRole === 'HR' ? 'HR Console' : 'Admin Console'}
        onClick={() => {
          if (currentRole === 'EMPLOYEE') navigate('/employee/home');
          else if (currentRole === 'HR') navigate('/hr/overview');
          else navigate('/admin/overview');
        }}
      />

      {/* Center: Wide ⌘K Command Bar */}
      <div className="hidden md:flex flex-1 max-w-xl mx-6">
        <motion.button
          whileHover={{ scale: 1.01, borderColor: 'var(--primary)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full h-10 px-4 rounded-lg bg-surface-muted border border-border hover:bg-surface text-left text-xs text-text-secondary flex items-center justify-between transition-colors group shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          aria-label="Open command palette (Press ⌘K)"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" strokeWidth={1.75} />
            <span className="group-hover:text-text transition-colors">
              Search apps, employees, policies, or actions…
            </span>
          </div>
          <kbd className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-secondary shadow-xs">
            ⌘&nbsp;K
          </kbd>
        </motion.button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setNotificationsOpen(prev => !prev)}
            className="w-9 h-9 rounded-full bg-surface-muted border border-border hover:border-primary hover:bg-surface text-text flex items-center justify-center relative transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            aria-label={`Notifications (${totalOrangeBadge} new)`}
            aria-expanded={notificationsOpen}
          >
            <Bell className="w-4 h-4 text-text-secondary hover:text-primary" strokeWidth={1.75} />
            {totalOrangeBadge > 0 && (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center shadow-xs tabular-nums"
              >
                {totalOrangeBadge}
              </motion.span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl border border-border shadow-popover p-4 text-text z-50 origin-top-right"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="font-heading font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Notifications
                  </span>
                  <span className="text-[11px] text-danger font-bold tabular-nums">{totalOrangeBadge} New</span>
                </div>
                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  <motion.div
                    whileHover={{ x: 2, backgroundColor: 'rgba(0, 113, 227, 0.05)' }}
                    onClick={() => {
                      navigate('/employee/work/tasks');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-surface-muted transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-spark-50 text-spark flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-text">Focus Task Pending</p>
                        <span className="text-[10px] text-text-tertiary">25m ago</span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        “Finalize Architecture Review Document” due today
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 2, backgroundColor: 'rgba(255, 59, 48, 0.05)' }}
                    onClick={() => {
                      navigate('/employee/me/profile');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-surface-muted transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-danger">Emergency Contacts Incomplete</p>
                        <span className="text-[10px] text-text-tertiary">1h ago</span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Please update your secondary emergency phone number
                      </p>
                    </div>
                  </motion.div>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-primary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={() => {
                      navigate('/employee/support/requests');
                      setNotificationsOpen(false);
                    }}
                    className="text-xs text-text-secondary hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                  >
                    All alerts →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar Dropdown */}
        <div className="relative z-50">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setAvatarOpen(prev => !prev)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-surface-muted border border-border hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="User profile and menu"
            aria-expanded={avatarOpen}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary via-magenta to-spark text-white font-bold text-xs flex items-center justify-center">
              {currentUser.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </div>
            <span className="hidden xl:inline text-xs font-medium text-text max-w-[100px] truncate">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-text-tertiary" strokeWidth={1.75} />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {avatarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-popover p-2 text-text z-50 origin-top-right"
              >
              {/* User Info Strip */}
              <div className="px-3 py-2.5 border-b border-border mb-1">
                <p className="font-heading font-bold text-sm text-text truncate">{currentUser.name}</p>
                <p className="text-xs text-text-secondary truncate">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                    {currentUser.role}
                  </span>
                  <span className="text-[11px] text-text-tertiary tabular-nums">ID: {currentUser.id}</span>
                </div>
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate('/employee/me/profile');
                    setAvatarOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium text-text hover:bg-surface-muted flex items-center gap-2 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <User className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  <span>My Profile</span>
                </button>

                {/* Switch Workspace only for multi-role privileged users (Admin / HR) */}
                {(currentUser.role === 'ADMIN' || currentUser.role === 'HR') && (
                  <div className="pt-1 border-t border-border mt-1">
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                      Switch Console
                    </div>

                    <button
                      onClick={() => handleRoleSwitch('EMPLOYEE')}
                      className="w-full px-3 py-1.5 rounded-lg text-xs text-text hover:bg-surface-muted flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-text-secondary" strokeWidth={1.75} />
                        Employee Workspace
                      </span>
                      {currentRole === 'EMPLOYEE' && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('HR')}
                      className="w-full px-3 py-1.5 rounded-lg text-xs text-text hover:bg-surface-muted flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                        HR Console
                      </span>
                      {currentRole === 'HR' && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />}
                    </button>

                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => handleRoleSwitch('ADMIN')}
                        className="w-full px-3 py-1.5 rounded-lg text-xs text-text hover:bg-surface-muted flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                          Admin Console
                        </span>
                        {currentRole === 'ADMIN' && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />}
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-1 border-t border-border mt-1">
                  <button
                    onClick={toggleDarkMode}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium text-text hover:bg-surface-muted flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="flex items-center gap-2">
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 text-spark" strokeWidth={1.75} />
                      ) : (
                        <Moon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                      )}
                      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/login');
                      setAvatarOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.75} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </header>
  );
};
