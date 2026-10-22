import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'lg' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  // Height & Text size
  const sizeStyles = {
    lg: 'h-[52px] px-5 text-base font-semibold rounded-xl',
    md: 'h-[44px] px-4 text-sm font-semibold rounded-xl',
  };

  // Variants
  const variantStyles = {
    primary:
      'bg-[#14532D] text-white hover:bg-[#0F3D2E] active:scale-[0.98] shadow-xs disabled:bg-[#14532D]/40 border border-transparent',
    secondary:
      'bg-white text-[#14532D] border border-[#14532D] hover:bg-[#E7F5EE] active:scale-[0.98] disabled:border-[#14532D]/30 disabled:text-[#14532D]/40',
    tertiary:
      'bg-transparent text-[#14532D] hover:bg-[#E7F5EE] active:scale-[0.98] disabled:text-[#14532D]/40 border border-transparent',
    destructive:
      'bg-transparent text-[#B5472B] border border-[#B5472B]/30 hover:bg-[#B5472B]/10 active:scale-[0.98] disabled:opacity-40',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 select-none transition-all duration-150 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#14532D]/30 focus:ring-offset-1 ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles[size]} ${variantStyles[variant]} ${
        disabled || loading ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</span>
      )}
      <span className="whitespace-nowrap truncate">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</span>
      )}
    </button>
  );
};
