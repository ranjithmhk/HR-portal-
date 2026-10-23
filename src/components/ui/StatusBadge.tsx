import React from 'react';
import { motion } from 'framer-motion';

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'role-employee'
  | 'role-hr'
  | 'role-admin';

interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'info',
  children,
  showDot = true,
  className = '',
  size = 'md',
}) => {
  const getStyles = (): { bg: string; text: string; dot: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-[#EDFBF4]',
          text: 'text-[#00A859]',
          dot: 'bg-[#00A859]',
        };
      case 'warning':
        return {
          bg: 'bg-[#FFF8EE]',
          text: 'text-[#FF9500]',
          dot: 'bg-[#FF9500]',
        };
      case 'danger':
        return {
          bg: 'bg-[#FDF1F2]',
          text: 'text-[#EE0014]',
          dot: 'bg-[#EE0014]',
        };
      case 'info':
        return {
          bg: 'bg-primary-50',
          text: 'text-primary',
          dot: 'bg-primary',
        };
      case 'role-employee':
        return {
          bg: 'bg-surface-muted text-text-secondary border border-border',
          text: 'text-text-secondary',
          dot: 'bg-text-tertiary',
        };
      case 'role-hr':
        return {
          bg: 'bg-primary-50 text-primary border border-primary-100',
          text: 'text-primary',
          dot: 'bg-primary',
        };
      case 'role-admin':
        return {
          bg: 'bg-magenta-50 text-magenta border border-magenta/20',
          text: 'text-magenta',
          dot: 'bg-magenta',
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-surface-muted text-text-secondary',
          text: 'text-text-secondary',
          dot: 'bg-text-tertiary',
        };
    }
  };

  const styles = getStyles();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.12 }}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full cursor-default select-none ${styles.bg} ${styles.text} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      <span>{children}</span>
    </motion.span>
  );
};
