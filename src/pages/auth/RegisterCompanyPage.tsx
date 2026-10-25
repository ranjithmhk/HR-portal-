import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NetworkWatermark } from '../../components/ui/NetworkMotif';
import { MHKLogo } from '../../components/ui/MHKLogo';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const RegisterCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [headcount, setHeadcount] = useState('50-200');
  const [country, setCountry] = useState('United States');
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDone(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-black flex items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      <NetworkWatermark className="text-primary" opacity={0.04} />

      <div className="relative z-10 w-full max-w-[480px] bg-surface rounded-2xl shadow-card border border-border p-8 sm:p-10 page-transition overflow-hidden">
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <MHKLogo variant="card" size="xl" className="mb-3" />
          <h1 className="text-2xl font-bold text-text font-heading tracking-tight">Register Your Enterprise</h1>
          <p className="text-xs text-text-secondary mt-1">
            Create your company workforce workspace
          </p>
        </div>

        {isDone ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-success" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-text">Workspace Provisioned</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Credentials sent to <strong className="text-text">{workEmail}</strong> for <strong className="text-text">{companyName}</strong>.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="h-10 px-6 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
            >
              Go to Sign In →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Tech Solutions LLC"
                className="w-full h-11 px-3.5 rounded-input border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Administrator Corporate Email</label>
              <input
                type="email"
                required
                value={workEmail}
                onChange={e => setWorkEmail(e.target.value)}
                placeholder="e.g. hr.admin@acmetech.com"
                className="w-full h-11 px-3.5 rounded-input border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Estimated Headcount</label>
                <select
                  value={headcount}
                  onChange={e => setHeadcount(e.target.value)}
                  className="w-full h-11 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="10-50">10 – 50 employees</option>
                  <option value="50-200">50 – 200 employees</option>
                  <option value="200-1000">200 – 1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block micro-label text-text-secondary mb-1">Primary Jurisdiction</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full h-11 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="United States">United States (USD)</option>
                  <option value="India">India (INR)</option>
                  <option value="United Kingdom">United Kingdom (GBP)</option>
                  <option value="Canada">Canada (CAD)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-xs hover:shadow mt-2"
            >
              Create Company Workspace →
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
