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
          bg: 'bg-emerald-50 border border-emerald-200',
          text: 'text-emerald-700 font-medium',
          dot: 'bg-emerald-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border border-amber-200',
          text: 'text-amber-800 font-medium',
          dot: 'bg-amber-500',
        };
      case 'danger':
        return {
          bg: 'bg-red-50 border border-red-200',
          text: 'text-red-700 font-medium',
          dot: 'bg-red-500',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border border-blue-200',
          text: 'text-blue-700 font-medium',
          dot: 'bg-blue-500',
        };
      case 'role-employee':
        return {
          bg: 'bg-gray-100 border border-gray-200',
          text: 'text-gray-700 font-medium',
          dot: 'bg-gray-400',
        };
      case 'role-hr':
        return {
          bg: 'bg-blue-50 border border-blue-200',
          text: 'text-blue-700 font-medium',
          dot: 'bg-blue-500',
        };
      case 'role-admin':
        return {
          bg: 'bg-purple-50 border border-purple-200',
          text: 'text-purple-700 font-medium',
          dot: 'bg-purple-500',
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-gray-100 border border-gray-200',
          text: 'text-gray-700 font-medium',
          dot: 'bg-gray-400',
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
