export const TOKENS = {
  colors: {
    primary: '#14532D',
    primaryDark: '#0F3D2E',
    tint: '#E7F5EE',
    tintBorder: '#AFF2C2',
    bronze: '#8C5D17',
    cream: '#F7F4EC',
    surface: '#FFFFFF',
    border: '#DFE4DC',
    text: '#1C2420',
    textSecondary: '#5B6660',
    critical: '#B5472B',
    warning: '#C2410C',
    info: '#1E5E3A',
  },
  radius: {
    sm: 'rounded-lg',   // 8px
    md: 'rounded-xl',  // 12px
    lg: 'rounded-2xl',  // 16px
    xl: 'rounded-3xl',  // 24px
    full: 'rounded-full',
  },
  shadows: {
    elevation1: 'shadow-[0_2px_8px_rgba(15,61,46,0.05)]',
    elevation2: 'shadow-[0_8px_24px_rgba(15,61,46,0.08)]',
    elevation3: 'shadow-[0_16px_40px_rgba(15,61,46,0.12)]',
  },
} as const;
