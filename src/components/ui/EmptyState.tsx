import React from 'react';
import { NetworkWatermark } from './NetworkMotif';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-dashed border-border bg-surface p-10 text-center flex flex-col items-center justify-center min-h-[260px] ${className}`}
    >
      <NetworkWatermark opacity={0.06} />
      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        <h3 className="font-heading text-base font-bold text-text mb-1">{title}</h3>
        <p className="text-xs text-text-secondary mb-6 leading-relaxed">{description}</p>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};
