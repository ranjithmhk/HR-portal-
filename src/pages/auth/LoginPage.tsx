import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { NetworkWatermark } from '../../components/ui/NetworkMotif';
import { MHKLogo } from '../../components/ui/MHKLogo';
import { useStore } from '../../context/StoreContext';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const { switchRole } = useStore();
  const navigate = useNavigate();

  const [companyCode, setCompanyCode] = useState('MHK-US');
  const [employeeId, setEmployeeId] = useState('800338');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent, targetRole: Role = 'EMPLOYEE') => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      switchRole(targetRole);
      setIsLoading(false);
      if (targetRole === 'EMPLOYEE') navigate('/employee/home');
      else if (targetRole === 'HR') navigate('/hr/overview');
      else navigate('/admin/overview');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-black flex items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      {/* Network Motif spreading from center */}
      <NetworkWatermark className="text-primary" opacity={0.04} />

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-surface rounded-2xl shadow-card border border-border p-8 sm:p-10 page-transition overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <MHKLogo variant="card" size="xl" className="mb-3" />
          <h1 className="text-2xl font-bold text-text font-heading tracking-tight">Welcome back</h1>
          <p className="text-xs text-text-secondary mt-1">Sign in to your enterprise workforce suite</p>
        </div>

        {/* Form */}
        <form onSubmit={e => handleSignIn(e, 'EMPLOYEE')} className="space-y-4">
          {/* Company Code */}
          <div>
            <label className="block micro-label text-text-secondary mb-1">Company Code</label>
            <input
              type="text"
              value={companyCode}
              onChange={e => setCompanyCode(e.target.value)}
              className="w-full h-11 px-3.5 rounded-input border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. MHK-US"
              required
            />
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" strokeWidth={2} />
              <span>Resolved: <strong>MHK Software Private Limited</strong></span>
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <label className="block micro-label text-text-secondary mb-1">Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              placeholder="e.g. 800338"
              className="w-full h-11 px-3.5 rounded-input border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="micro-label text-text-secondary">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-input border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-text-tertiary hover:text-text"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {/* Submit CTA (Apple Action Blue Button) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        {/* Quick Demo Segment Switcher */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="micro-label text-text-tertiary text-center mb-2.5">
            Quick One-Click Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={e => handleSignIn(e, 'EMPLOYEE')}
              className="px-2 py-2 rounded-lg bg-surface-muted hover:bg-primary-50 text-[11px] font-semibold text-text hover:text-primary border border-border transition-all text-center"
            >
              Employee
              <span className="block text-[10px] text-text-tertiary font-normal">#800338</span>
            </button>
            <button
              onClick={e => handleSignIn(e, 'HR')}
              className="px-2 py-2 rounded-lg bg-surface-muted hover:bg-primary-50 text-[11px] font-semibold text-text hover:text-primary border border-border transition-all text-center"
            >
              HR Console
              <span className="block text-[10px] text-text-tertiary font-normal">#800102</span>
            </button>
            <button
              onClick={e => handleSignIn(e, 'ADMIN')}
              className="px-2 py-2 rounded-lg bg-surface-muted hover:bg-primary-50 text-[11px] font-semibold text-text hover:text-primary border border-border transition-all text-center"
            >
              Admin
              <span className="block text-[10px] text-text-tertiary font-normal">#800001</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 text-center space-y-1 text-xs text-text-secondary border-t border-border/40">
          <p>
            Need access?{' '}
            <span className="text-text font-medium">Contact your administrator</span>
          </p>
          <p>
            New company?{' '}
            <Link to="/register-company" className="text-primary font-semibold hover:underline">
              Register your company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
