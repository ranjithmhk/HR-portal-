import React, { useState } from 'react';

interface MHKLogoProps {
  variant?: 'header' | 'light' | 'dark' | 'symbol' | 'card';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  onClick?: () => void;
}

export const MHKLogo: React.FC<MHKLogoProps> = ({
  variant = 'header',
  className = '',
  size = 'md',
  showBadge = true,
  badgeText = 'HR Portal',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  // Height mappings based on size prop
  const heightClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
  }[size];

  if (variant === 'symbol') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img
          src="/mhk-symbol.png"
          alt="MHK Network Motif"
          className={`${heightClasses} w-auto object-contain`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3.5 select-none shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {/* Official MHK Logo (Transparent with dark text & vibrant 3D network spokes for Apple light header) */}
        <div className="flex items-center">
          <img
            src="/mhk-logo-transparent.png"
            alt="MHK Software Private Limited"
            className={`${heightClasses} w-auto max-w-[210px] object-contain hover:opacity-90 transition-opacity`}
            onError={e => {
              (e.target as HTMLImageElement).src = '/mhk-logo.png';
            }}
          />
        </div>

        {/* HR Portal Pill Badge */}
        {showBadge && (
          <div className="hidden sm:flex items-center pl-3 border-l border-border">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-surface-muted text-text-secondary border border-border flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {badgeText}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'card' || variant === 'light') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="p-1.5 rounded-xl bg-white/50 backdrop-blur-sm">
          <img
            src="/mhk-logo.png"
            alt="MHK Software Private Limited"
            className={`${heightClasses} w-auto object-contain max-w-[240px]`}
            onError={() => setImgError(true)}
          />
        </div>
      </div>
    );
  }

  // Dark variant
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src="/mhk-logo-dark.png"
        alt="MHK Software Private Limited"
        className={`${heightClasses} w-auto object-contain`}
      />
    </div>
  );
};

export default MHKLogo;
