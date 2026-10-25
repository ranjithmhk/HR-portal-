import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { NetworkWatermark } from './NetworkMotif';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'ink' | 'hero';
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  const isClickable = Boolean(onClick);

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`relative overflow-hidden rounded-2xl hero-gradient text-white p-6 sm:p-8 shadow-lg border border-white/10 ${className}`}
      >
        {/* Clean accent along top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-primary-300 opacity-90" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <NetworkWatermark className="text-white/20" opacity={0.12} />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }

  if (variant === 'ink') {
    return (
      <motion.div
        whileHover={isClickable || hoverEffect ? { y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' } : undefined}
        whileTap={isClickable ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl bg-surface text-text p-5 border border-border shadow-xs ${
          isClickable ? 'cursor-pointer' : ''
        } ${className}`}
      >
        <NetworkWatermark className="text-primary/10" opacity={0.05} />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }

  if (variant === 'muted') {
    return (
      <motion.div
        onClick={onClick}
        whileHover={isClickable || hoverEffect ? { y: -2, borderColor: 'var(--border-strong)' } : undefined}
        whileTap={isClickable ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2 }}
        className={`rounded-xl bg-surface-muted border border-border p-5 ${
          isClickable ? 'cursor-pointer hover:border-border-strong transition-colors' : ''
        } ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        isClickable || hoverEffect
          ? { y: -2, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)', borderColor: 'var(--border-strong)' }
          : undefined
      }
      whileTap={isClickable ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2 }}
      className={`rounded-xl bg-surface border border-border p-5 shadow-sm ${
        isClickable ? 'cursor-pointer hover:border-border-strong transition-colors' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
