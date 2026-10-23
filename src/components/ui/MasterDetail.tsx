import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

interface MasterDetailProps {
  master: React.ReactNode;
  detail: React.ReactNode | null;
  hasSelection: boolean;
  onClearSelection?: () => void;
  title?: string;
  className?: string;
  detailWidth?: string;
}

export const MasterDetail: React.FC<MasterDetailProps> = ({
  master,
  detail,
  hasSelection,
  onClearSelection,
  title,
  className = '',
  detailWidth = 'w-full lg:w-[460px] xl:w-[500px]',
}) => {
  return (
    <div className={`relative flex flex-col lg:flex-row gap-6 items-start ${className}`}>
      {/* Master View */}
      <div
        className={`w-full transition-all duration-200 ${
          hasSelection ? 'hidden lg:block lg:flex-1 min-w-0' : 'block flex-1 min-w-0'
        }`}
      >
        {master}
      </div>

      {/* Detail Pane */}
      {hasSelection && detail && (
        <div
          className={`${detailWidth} shrink-0 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col sticky top-24 max-h-[calc(100vh-120px)] page-transition`}
        >
          {/* Detail Header with back / close button */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-surface-muted/40">
            <div className="flex items-center gap-2">
              <button
                onClick={onClearSelection}
                className="lg:hidden p-1.5 -ml-1 text-text-secondary hover:text-text rounded-md hover:bg-surface-muted"
                aria-label="Back to list"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
              </button>
              {title && <h3 className="font-semibold text-text text-sm truncate">{title}</h3>}
            </div>
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-text-tertiary hover:text-text p-1.5 rounded-md hover:bg-surface-muted transition-colors"
                aria-label="Close detail pane"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            )}
          </div>

          {/* Detail Content */}
          <div className="p-5 overflow-y-auto flex-1">{detail}</div>
        </div>
      )}
    </div>
  );
};
