import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopHeader } from './TopHeader';
import { NavBar } from './NavBar';
import { AssistantPanel } from './AssistantPanel';
import { CommandPalette } from './CommandPalette';
import { MHKLogo } from './MHKLogo';
import { useStore } from '../../context/StoreContext';
import {
  Home,
  Clock,
  Calendar,
  CheckSquare,
  Menu,
  X,
  User,
  Shield,
  Briefcase,
  FileText,
  DollarSign,
  Users,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { aiAssistantOpen, currentRole, switchRole } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bottom navigation items for mobile
  const mobileNavItems =
    currentRole === 'EMPLOYEE'
      ? [
          { label: 'Home', href: '/employee/home', icon: <Home className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Time', href: '/employee/time/leaves', icon: <Calendar className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Tasks', href: '/employee/work/tasks', icon: <CheckSquare className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Me', href: '/employee/me/profile', icon: <User className="w-5 h-5" strokeWidth={1.75} /> },
        ]
      : currentRole === 'HR'
      ? [
          { label: 'Overview', href: '/hr/overview', icon: <Home className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Recruit', href: '/hr/recruit/candidates', icon: <Users className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Leaves', href: '/hr/time-pay/leave-approvals', icon: <Calendar className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Compliance', href: '/hr/risk/compliance', icon: <Shield className="w-5 h-5" strokeWidth={1.75} /> },
        ]
      : [
          { label: 'Overview', href: '/admin/overview', icon: <Home className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Handbooks', href: '/admin/people/handbooks', icon: <FileText className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'Signers', href: '/admin/accounting/signers', icon: <Shield className="w-5 h-5" strokeWidth={1.75} /> },
          { label: 'System', href: '/admin/system/roles', icon: <CheckSquare className="w-5 h-5" strokeWidth={1.75} /> },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
      {/* Sticky Top Header & Navigation Bar (Always accessible from anywhere) */}
      <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md shadow-xs">
        <TopHeader />
        <div className="hidden md:block">
          <NavBar />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full pb-24 md:pb-12">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Sticky Floating Copilot & Assistant Chat at Bottom */}
      <AssistantPanel />

      {/* Command Palette (⌘K) */}
      <CommandPalette />

      {/* Mobile Bottom Tab Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md text-text border-t border-border flex items-center justify-around z-40 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        {mobileNavItems.map(item => {
          const isActive = location.pathname === item.href;
          return (
            <motion.button
              key={item.href}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(item.href)}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg ${
                isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && <span className="w-4 h-0.5 rounded-full bg-primary mt-0.5" />}
            </motion.button>
          );
        })}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open more navigation options"
          className="flex flex-col items-center justify-center w-16 h-full text-text-secondary hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </motion.button>
      </nav>

      {/* Mobile Full-Screen Sheet for 'More' */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="md:hidden fixed inset-0 z-50 bg-surface text-text flex flex-col p-6 overflow-y-auto overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Menu Navigation"
          >
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <MHKLogo variant="header" size="sm" showBadge={false} />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation sheet"
                className="p-2 text-text hover:bg-surface-muted rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-6 h-6" strokeWidth={1.75} />
              </motion.button>
            </div>

            <div className="py-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-3">
                  Switch Role Console
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      switchRole('EMPLOYEE');
                      navigate('/employee/home');
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      currentRole === 'EMPLOYEE'
                        ? 'hero-gradient border-transparent text-white shadow-sm'
                        : 'bg-surface-muted border-border text-text-secondary hover:text-text'
                    }`}
                  >
                    Employee
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      switchRole('HR');
                      navigate('/hr/overview');
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      currentRole === 'HR'
                        ? 'hero-gradient border-transparent text-white shadow-sm'
                        : 'bg-surface-muted border-border text-text-secondary hover:text-text'
                    }`}
                  >
                    HR Console
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      switchRole('ADMIN');
                      navigate('/admin/overview');
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      currentRole === 'ADMIN'
                        ? 'hero-gradient border-transparent text-white shadow-sm'
                        : 'bg-surface-muted border-border text-text-secondary hover:text-text'
                    }`}
                  >
                    Admin
                  </motion.button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <NavBar />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
