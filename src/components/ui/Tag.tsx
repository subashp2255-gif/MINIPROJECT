import React from 'react';

export type TagVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'advisory';

export interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function statusToTagVariant(status: string): TagVariant {
  const s = status.toLowerCase();
  if (['confirmed', 'optimal', 'in_storage', 'active', 'good', 'verified', 'connected'].includes(s)) {
    return 'success';
  }
  if (['low_stock', 'warning', 'expiring', 'pending', 'pending_approval'].includes(s)) {
    return 'warning';
  }
  if (['critical', 'danger', 'action_required', 'conflict', 'depleted', 'cancelled'].includes(s)) {
    return 'danger';
  }
  if (['advisory', 'ai', 'forecast'].includes(s)) {
    return 'advisory';
  }
  if (['info', 'pickup', 'transfer'].includes(s)) {
    return 'info';
  }
  return 'neutral';
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'neutral',
  icon,
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-[#E7F5EE] text-[#14532D] border-[#AFF2C2]',
    warning: 'bg-[#FFF2EB] text-[#C2410C] border-[#FED7AA]',
    danger: 'bg-[#FBEBE7] text-[#B5472B] border-[#FCA5A5]',
    info: 'bg-[#E7F5EE] text-[#1E5E3A] border-[#AFF2C2]',
    neutral: 'bg-[#F7F4EC] text-[#5B6660] border-[#DFE4DC]',
    advisory: 'bg-[#FEF3C7] text-[#8C5D17] border-[#FDE68A]',
  };

  const dotColors = {
    success: 'bg-[#14532D]',
    warning: 'bg-[#C2410C]',
    danger: 'bg-[#B5472B]',
    info: 'bg-[#1E5E3A]',
    neutral: 'bg-[#5B6660]',
    advisory: 'bg-[#8C5D17]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold border select-none whitespace-nowrap truncate max-w-full ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
