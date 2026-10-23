import React from 'react';

interface RailLayoutProps {
  children: React.ReactNode;
  rail: React.ReactNode;
  className?: string;
  railClassName?: string;
}

export const RailLayout: React.FC<RailLayoutProps> = ({
  children,
  rail,
  className = '',
  railClassName = '',
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${className}`}>
      {/* Main column (8/12) */}
      <div className="lg:col-span-8 space-y-8 min-w-0">{children}</div>

      {/* Sticky Right Rail (4/12) */}
      <aside className={`lg:col-span-4 space-y-6 lg:sticky lg:top-24 min-w-0 ${railClassName}`}>
        {rail}
      </aside>
    </div>
  );
};
