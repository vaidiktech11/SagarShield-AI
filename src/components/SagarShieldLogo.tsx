import React from 'react';

interface SagarShieldLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  subtitle?: string;
}

export const SagarShieldLogo: React.FC<SagarShieldLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  subtitle,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Bespoke Emblem combining a protective shield with dynamic ocean wave motifs ("Sagar") */}
      <div
        className={`relative ${sizeMap[size]} shrink-0 rounded-2xl p-1 bg-gradient-to-b from-cyan-400 via-blue-600 to-indigo-900 shadow-lg shadow-cyan-500/25 border border-cyan-300/30 flex items-center justify-center overflow-hidden`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="waveLight" x1="12" y1="20" x2="36" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="waveDeep" x1="10" y1="26" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="beaconGlow" x1="24" y1="6" x2="24" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Outer Shield Boundary */}
          <path
            d="M24 4L39 9.5C39 24.5 32 37 24 44C16 37 9 24.5 9 9.5L24 4Z"
            fill="url(#shieldGrad)"
            stroke="#e0f2fe"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Shield Inset Border Rim */}
          <path
            d="M24 7.5L36.5 12C36.5 24 30.5 34.5 24 40.5C17.5 34.5 11.5 24 11.5 12L24 7.5Z"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeOpacity="0.45"
            fill="none"
          />

          {/* Background Ocean Wave (Deep Tidal Swell) */}
          <path
            d="M12 28.5C16.5 24 21 31 26 27.5C30 24.8 33.5 27 36 29C34.5 35 29.5 39.5 24 42C18.5 39.5 13.5 35 12 28.5Z"
            fill="url(#waveDeep)"
            opacity="0.85"
          />

          {/* Foreground Ocean Wave (Sagar Crest Wave) */}
          <path
            d="M13 22.5C17.5 18 22.5 26 28 22C32 19 35.5 22.5 36.5 25C34 32.5 29.5 37.5 24 41C18.5 37.5 14 32.5 13 22.5Z"
            fill="url(#waveLight)"
          />

          {/* Foam Crest Highlight */}
          <path
            d="M14.5 22C18.5 18.5 23 25.5 28.5 21.5C32 19 34.5 21.5 36 23.5"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />

          {/* Anticipatory Beacon / Early Warning Star at Shield Apex */}
          <circle cx="24" cy="12" r="3.2" fill="url(#beaconGlow)" />
          <path
            d="M24 7.5V16.5M19.5 12H28.5"
            stroke="#ffffff"
            strokeWidth="1.25"
            strokeLinecap="round"
          />

          {/* Subtle Radar Wave Arc above beacon */}
          <path
            d="M18 9.5C19.8 8 22 7.2 24 7.2C26 7.2 28.2 8 30 9.5"
            stroke="#a5f3fc"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>

        {/* Ambient pulse ring */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              SagarShield <span className="text-cyan-400 font-black">AI</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono uppercase tracking-wider font-semibold">
              v1.0
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};
