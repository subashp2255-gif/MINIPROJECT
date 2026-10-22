import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  onClick,
  className = '',
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] transition-all ${
        onClick ? 'cursor-pointer hover:border-[#14532D]/40 hover:shadow-[0_4px_16px_rgba(15,61,46,0.08)] active:scale-[0.995]' : ''
      } ${className}`}
    >
      {header && (
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 border-b border-[#DFE4DC]/50">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="px-4 sm:px-5 py-3 border-t border-[#DFE4DC]/50 bg-[#F7F4EC]/40 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};
