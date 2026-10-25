import React from 'react';
import { motion } from 'framer-motion';

export interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta?: {
    text: string;
    positive?: boolean;
    neutral?: boolean;
    danger?: boolean;
  };
  hasGradientAccent?: boolean;
  onClick?: () => void;
}

interface StatStripProps {
  stats: StatItem[];
  className?: string;
}

export const StatStrip: React.FC<StatStripProps> = ({ stats, className = '' }) => {
  return (
    <div
      className={`w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border ${className}`}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          onClick={stat.onClick}
          tabIndex={stat.onClick ? 0 : undefined}
          role={stat.onClick ? 'button' : undefined}
          onKeyDown={e => {
            if (stat.onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              stat.onClick();
            }
          }}
          whileHover={{
            y: -2,
            backgroundColor: stat.hasGradientAccent ? undefined : 'rgba(5, 108, 184, 0.035)',
            transition: { duration: 0.15 },
          }}
          whileTap={stat.onClick ? { scale: 0.985 } : undefined}
          className={`p-5 flex flex-col justify-between transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
            stat.hasGradientAccent
              ? 'bg-gradient-to-br from-primary-50/60 to-magenta-50/40'
              : 'hover:bg-surface-muted/40'
          } ${stat.onClick ? 'cursor-pointer' : ''}`}
        >
          {stat.hasGradientAccent && (
            <div className="absolute top-0 left-0 right-0 h-1 hero-gradient" />
          )}

          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="micro-label text-text-secondary">{stat.label}</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                stat.hasGradientAccent
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-primary-50 text-primary'
              }`}
            >
              {stat.icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-auto">
            <span className="text-kpi text-text tracking-tight tabular-nums">{stat.value}</span>
            {stat.delta && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                  stat.delta.danger
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : stat.delta.positive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-surface-muted text-text-secondary border border-border'
                }`}
              >
                {stat.delta.text}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
