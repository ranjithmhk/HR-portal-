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
    <div className="min-h-screen w-full bg-[#F8F9FB] flex items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      <NetworkWatermark className="text-primary" opacity={0.04} />

      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-[20px] shadow-zoho border border-[#E7EBF0] p-8 sm:p-10 page-transition overflow-hidden">
        {/* Zoho 4-Color Brand Stripe */}
        <div className="h-1 w-full zoho-brand-stripe absolute top-0 left-0 right-0" />

        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <MHKLogo variant="card" size="xl" className="mb-3" />
          <h1 className="text-2xl font-bold text-text font-heading">Reset Password</h1>
          <div className="w-8 h-[2.5px] bg-gradient-to-r from-[#EE0014] to-[#FED600] rounded-full my-2" />
          <p className="text-xs text-text-secondary">
            Enter your official company email to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EDFBF4] text-[#00A859] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-[#00A859]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-text">Password Reset Link Sent</h3>
              <p className="text-xs text-text-secondary mt-1">
                We've sent recovery instructions to <strong className="text-text">{email}</strong>. Please check your inbox and spam folder.
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
              className="w-full h-11 rounded-btn bg-[#EE0014] hover:bg-[#D60012] text-white font-semibold text-sm transition-all shadow-xs hover:shadow"
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
