import React from 'react';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function getInitials(name: string): string {
  if (!name) return 'AG';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const initials = getInitials(name);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#14532D] to-[#0F3D2E] text-white font-bold ring-2 ring-white select-none shrink-0 tracking-tight ${sizeMap[size]} ${className}`}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
};
