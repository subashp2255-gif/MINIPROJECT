import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 36, className = '', showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-2 flex-shrink-0 ${className}`}>
      <div
        className="inline-flex items-center justify-center rounded-xl bg-white border border-[#0F3D2E]/10 shadow-[0_2px_8px_rgba(15,61,46,0.06)] p-0.5 overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src="/agrisync-icon.png"
          alt="AgriSync Emblem"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center font-extrabold text-[17px] leading-tight tracking-tight">
            <span className="text-[#134E35]">Agri</span>
            <span className="text-[#368638]">Sync</span>
          </div>
          <span className="text-[9px] font-medium text-[#5B6660] -mt-0.5 tracking-tight">
            Smart Farming
          </span>
        </div>
      )}
    </div>
  );
};
