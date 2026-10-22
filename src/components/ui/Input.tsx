import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[#1C2420]">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3.5 text-[#5B6660] pointer-events-none w-5 h-5 flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full h-12 bg-white rounded-xl border text-base text-[#1C2420] placeholder:text-[#5B6660]/60 transition-all outline-hidden ${
            icon ? 'pl-11 pr-4' : 'px-4'
          } ${
            error
              ? 'border-[#B5472B] focus:border-[#B5472B] focus:ring-2 focus:ring-[#B5472B]/20'
              : 'border-[#DFE4DC] focus:border-[#14532D] focus:ring-2 focus:ring-[#14532D]/20'
          } disabled:bg-[#F7F4EC] disabled:text-[#5B6660] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-[#B5472B]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#5B6660]">{helperText}</p>
      ) : null}
    </div>
  );
};
