import React from 'react';

interface HubbLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon-only';
  showBadge?: boolean;
  className?: string;
}

export const HubbLogo: React.FC<HubbLogoProps> = ({
  size = 'md',
  showBadge = true,
  className = ''
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
    'icon-only': 'w-9 h-9'
  };

  const titleSizeClasses = {
    sm: 'text-sm font-black',
    md: 'text-base font-black',
    lg: 'text-xl font-black',
    xl: 'text-2xl sm:text-3xl font-black',
    'icon-only': 'hidden'
  };

  const subtitleSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs sm:text-sm',
    'icon-only': 'hidden'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Crisp Vector Hubb Brand Icon with Intertwined Hearts Emblem */}
      <div 
        className={`relative ${iconSizeClasses[size]} rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 p-[1.5px] shadow-lg shadow-rose-950/60 flex-shrink-0 flex items-center justify-center`}
      >
        <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden relative">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/30 via-transparent to-amber-500/20 pointer-events-none" />
          
          <svg 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10 drop-shadow-sm"
          >
            <defs>
              <linearGradient id="hubbGradientPrimary" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="hubbGradientSecondary" x1="40" y1="8" x2="10" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="60%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#BE123C" />
              </linearGradient>
            </defs>
            
            {/* Interconnected Heart & Universal Ribbon Symbol */}
            {/* Left loop */}
            <path
              d="M16 11C11.5817 11 8 14.5817 8 19C8 26.2 16.5 33.5 24 38.5C19.5 34 14 28.5 14 21C14 17.134 17.134 14 21 14C23.2 14 25.1 15 26.3 16.6C25.2 14.2 22.8 11 16 11Z"
              fill="url(#hubbGradientPrimary)"
              opacity="0.95"
            />
            
            {/* Right loop intertwining */}
            <path
              d="M32 11C25.2 11 22.8 14.2 21.7 16.6C22.9 15 24.8 14 27 14C30.866 14 34 17.134 34 21C34 28.5 28.5 34 24 38.5C31.5 33.5 40 26.2 40 19C40 14.5817 36.4183 11 32 11Z"
              fill="url(#hubbGradientSecondary)"
            />

            {/* Central Core Connection Sparkle */}
            <circle cx="24" cy="23" r="3.2" fill="#FFFFFF" />
            <path d="M24 16V18M24 28V30M18 23H16M32 23H30" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Typography Branding (if not icon-only) */}
      {size !== 'icon-only' && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`${titleSizeClasses[size]} text-white tracking-tight flex items-center`}>
              hubb
            </span>
            {showBadge && (
              <span className="text-[9px] font-extrabold text-rose-300 bg-rose-950/80 border border-rose-500/40 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Universal
              </span>
            )}
          </div>
          <span className={`${subtitleSizeClasses[size]} text-neutral-400 font-medium tracking-tight`}>
            Accessible Dating
          </span>
        </div>
      )}
    </div>
  );
};
