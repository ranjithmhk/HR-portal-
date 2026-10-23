import React from 'react';

export const NetworkWatermark: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 0.05,
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Spokes (Connecting lines) */}
        <line x1="120" y1="80" x2="280" y2="140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="280" y1="140" x2="420" y2="90" stroke="currentColor" strokeWidth="1.5" />
        <line x1="420" y1="90" x2="600" y2="170" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="280" y1="140" x2="310" y2="300" stroke="currentColor" strokeWidth="1.5" />
        <line x1="310" y1="300" x2="190" y2="420" stroke="currentColor" strokeWidth="1.5" />
        <line x1="310" y1="300" x2="490" y2="360" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="490" y1="360" x2="680" y2="320" stroke="currentColor" strokeWidth="1.5" />
        <line x1="490" y1="360" x2="520" y2="520" stroke="currentColor" strokeWidth="1.5" />
        <line x1="190" y1="420" x2="350" y2="510" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="350" y1="510" x2="520" y2="520" stroke="currentColor" strokeWidth="1.5" />

        {/* Nodes (Circles with Zoho Brand Colors: Blue, Red, Green, Yellow) */}
        <circle cx="120" cy="80" r="14" fill="#056CB8" fillOpacity="0.25" />
        <circle cx="120" cy="80" r="6" fill="#056CB8" />

        <circle cx="280" cy="140" r="18" fill="#EE0014" fillOpacity="0.2" />
        <circle cx="280" cy="140" r="8" fill="#EE0014" />

        <circle cx="420" cy="90" r="12" fill="#FED600" fillOpacity="0.3" />
        <circle cx="420" cy="90" r="5" fill="#FED600" />

        <circle cx="600" cy="170" r="16" fill="#00A859" fillOpacity="0.2" />
        <circle cx="600" cy="170" r="7" fill="#00A859" />

        <circle cx="310" cy="300" r="24" fill="#056CB8" fillOpacity="0.15" />
        <circle cx="310" cy="300" r="11" fill="#056CB8" />

        <circle cx="190" cy="420" r="15" fill="#FED600" fillOpacity="0.3" />
        <circle cx="190" cy="420" r="6" fill="#FED600" />

        <circle cx="490" cy="360" r="20" fill="#EE0014" fillOpacity="0.2" />
        <circle cx="490" cy="360" r="9" fill="#EE0014" />

        <circle cx="680" cy="320" r="13" fill="#056CB8" fillOpacity="0.25" />
        <circle cx="680" cy="320" r="5" fill="#056CB8" />

        <circle cx="350" cy="510" r="16" fill="#00A859" fillOpacity="0.2" />
        <circle cx="350" cy="510" r="7" fill="#00A859" />

        <circle cx="520" cy="520" r="14" fill="#FED600" fillOpacity="0.3" />
        <circle cx="520" cy="520" r="6" fill="#FED600" />
      </svg>
    </div>
  );
};

export const NetworkSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center animate-spin ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        {/* Central spoke network */}
        <circle cx="18" cy="18" r="3" fill="#056CB8" />
        {/* Spoke 1 - Zoho Blue */}
        <line x1="18" y1="18" x2="18" y2="5" stroke="#056CB8" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="18" cy="5" r="3" fill="#056CB8" />

        {/* Spoke 2 - Zoho Red */}
        <line x1="18" y1="18" x2="29" y2="24" stroke="#EE0014" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="29" cy="24" r="3" fill="#EE0014" />

        {/* Spoke 3 - Zoho Green */}
        <line x1="18" y1="18" x2="7" y2="24" stroke="#00A859" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="7" cy="24" r="3" fill="#00A859" />
      </svg>
    </div>
  );
};

export const NetworkLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => {
  return (
    <img
      src="/mhk-symbol.png"
      alt="MHK Network"
      className={`${className} object-contain shrink-0`}
      loading="eager"
    />
  );
};
