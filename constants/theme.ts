// AI Cyber Shield - Design System Tokens
// Cyberpunk High-Tech Dark Mode Theme

export const Colors = {
  // Core Backgrounds
  bg: {
    primary: '#0A0E17',
    secondary: '#0D1220',
    card: '#111827',
    glass: 'rgba(0, 229, 255, 0.04)',
    glassStrong: 'rgba(0, 229, 255, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.85)',
    emergency: 'rgba(255, 30, 30, 0.97)',
  },
  // Neon Accent System
  neon: {
    cyan: '#00E5FF',
    cyanDim: 'rgba(0, 229, 255, 0.3)',
    cyanGlow: 'rgba(0, 229, 255, 0.15)',
    green: '#00FF66',
    greenDim: 'rgba(0, 255, 102, 0.3)',
    greenGlow: 'rgba(0, 255, 102, 0.15)',
    amber: '#FFB800',
    amberDim: 'rgba(255, 184, 0, 0.3)',
    amberGlow: 'rgba(255, 184, 0, 0.15)',
    red: '#FF4D4D',
    redDim: 'rgba(255, 77, 77, 0.3)',
    redGlow: 'rgba(255, 77, 77, 0.15)',
  },
  // Text
  text: {
    primary: '#E8F4FD',
    secondary: '#8BA6C7',
    muted: '#4A6080',
    inverse: '#0A0E17',
    cyan: '#00E5FF',
    green: '#00FF66',
    amber: '#FFB800',
    red: '#FF4D4D',
  },
  // Border / Dividers
  border: {
    subtle: 'rgba(0, 229, 255, 0.12)',
    active: 'rgba(0, 229, 255, 0.5)',
    danger: 'rgba(255, 77, 77, 0.5)',
    safe: 'rgba(0, 255, 102, 0.5)',
    warning: 'rgba(255, 184, 0, 0.5)',
  },
  // Risk Levels
  risk: {
    safe: '#00FF66',
    safeGlow: 'rgba(0, 255, 102, 0.2)',
    warning: '#FFB800',
    warningGlow: 'rgba(255, 184, 0, 0.2)',
    danger: '#FF4D4D',
    dangerGlow: 'rgba(255, 77, 77, 0.2)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  cyan: {
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  green: {
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  red: {
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  amber: {
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};
