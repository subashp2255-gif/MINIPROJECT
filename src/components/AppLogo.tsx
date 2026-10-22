import React from 'react';

export interface AppLogoProps {
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  showText = true,
  showSubtitle = false,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* Inline SVG Mark */}
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] flex items-center justify-center p-1.5 shrink-0 overflow-hidden"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Warehouse / Chamber outline */}
          <path
            d="M5 13L16 5L27 13V25C27 26.1046 26.1046 27 25 27H7C5.89543 27 5 26.1046 5 25V13Z"
            fill="#E7F5EE"
            stroke="#14532D"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Sprout / Leaf representing rural harvest */}
          <path
            d="M16 11V22M16 14C18.5 11.5 22 12 22 14.5C22 17 18.5 17.5 16 17.5M16 17C13.5 14.5 10 15 10 17.5C10 20 13.5 20.5 16 20.5"
            stroke="#14532D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Snowflake dot accent */}
          <circle cx="16" cy="8.5" r="1.5" fill="#368638" />
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center font-extrabold text-[17px] tracking-tight">
            <span className="text-[#14532D]">Agri</span>
            <span className="text-[#2E7D32]">Sync</span>
          </div>
          {showSubtitle && (
            <span className="text-xs font-medium text-[#5B6660] tracking-tight mt-0.5">
              Smart Farming
            </span>
          )}
        </div>
      )}
    </div>
  );
};
