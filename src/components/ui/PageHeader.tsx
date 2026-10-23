import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  badge?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  subtitle,
  actions,
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`pt-6 pb-2 border-b border-border mb-6 ${className}`}>
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-text-tertiary mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" strokeWidth={1.75} />}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? 'text-text-secondary font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight font-heading leading-tight">
            {title}
          </h1>
          {/* Zoho Signature Accent Line Under Big Header */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="h-[2.5px] bg-gradient-to-r from-[#EE0014] to-[#FED600] rounded-full mt-2"
          />
          {subtitle && (
            <p className="text-sm text-text-secondary mt-2 leading-relaxed max-w-3xl">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0 pt-1">{actions}</div>
        )}
      </motion.div>

      {/* Underline Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-6 mt-6 overflow-x-auto no-scrollbar border-t border-border/50 pt-2 -mb-[1px]">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`group pb-3 pt-1 text-sm font-medium relative whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive ? 'text-primary font-semibold' : 'text-text-secondary hover:text-text'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <motion.span
                    whileHover={{ scale: 1.08 }}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'bg-surface-muted text-text-tertiary group-hover:text-text-secondary'
                    }`}
                  >
                    {tab.count}
                  </motion.span>
                )}
                {tab.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-spark-50 text-spark">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="activePageHeaderTab"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};
