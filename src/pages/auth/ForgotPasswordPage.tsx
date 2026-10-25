import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NetworkWatermark } from '../../components/ui/NetworkMotif';
import { MHKLogo } from '../../components/ui/MHKLogo';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] flex items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      <NetworkWatermark className="text-primary" opacity={0.04} />

      <div className="relative z-10 w-full max-w-[440px] bg-surface rounded-2xl shadow-card border border-border p-8 sm:p-10 page-transition overflow-hidden">
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <MHKLogo variant="card" size="xl" className="mb-3" />
          <h1 className="text-2xl font-bold text-text font-heading tracking-tight">Reset Password</h1>
          <p className="text-xs text-text-secondary mt-1">
            Enter your official company email for recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-success" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-text">Password Reset Link Sent</h3>
              <p className="text-xs text-text-secondary mt-1">
                Recovery instructions sent to <strong className="text-text">{email}</strong>.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Company Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. vikram.rao@mhktechinc.com"
                className="w-full h-11 px-3.5 rounded-input border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-xs hover:shadow"
            >
              Send Password Reset Link →
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
