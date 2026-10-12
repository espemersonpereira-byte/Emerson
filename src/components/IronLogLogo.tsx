import React from 'react';

interface IronLogLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const IronLogLogo: React.FC<IronLogLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDims = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const textSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 512 512"
        fill="none"
        className={`${iconDims} shrink-0`}
        aria-label="Logotipo IRONLOG"
      >
        <rect width="512" height="512" rx="112" fill="#0A0B0E" />
        <rect x="24" y="24" width="464" height="464" rx="92" stroke="#1E2330" strokeWidth="8" />
        {/* Outer Heavy Plates */}
        <rect x="86" y="136" width="38" height="240" rx="14" style={{ fill: 'var(--accent-500, #F97316)' }} />
        <rect x="388" y="136" width="38" height="240" rx="14" style={{ fill: 'var(--accent-500, #F97316)' }} />
        {/* Inner Plates */}
        <rect x="136" y="168" width="32" height="176" rx="10" style={{ fill: 'var(--accent-600, #EA580C)' }} />
        <rect x="344" y="168" width="32" height="176" rx="10" style={{ fill: 'var(--accent-600, #EA580C)' }} />
        {/* Barbell & Hex Shield */}
        <rect x="54" y="238" width="404" height="36" rx="12" fill="#F8FAFC" />
        <path
          d="M256 156L316 190V322L256 356L196 322V190L256 156Z"
          fill="#13151B"
          style={{ stroke: 'var(--accent-500, #F97316)' }}
          strokeWidth="16"
          strokeLinejoin="round"
        />
        <path d="M240 214H272V298H240V214Z" fill="#F8FAFC" />
      </svg>
      {showText && (
        <span
          className={`font-display font-bold tracking-wider text-slate-900 dark:text-white whitespace-nowrap ${textSize}`}
        >
          IRON<span className="text-orange-500">LOG</span>
        </span>
      )}
    </div>
  );
};
