import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F7F4EF',
    surface: '#FFFFFF',
    surfaceMuted: '#EFEAE2',
    border: '#E4DED4',
    text: '#1D1B18',
    textSecondary: '#6E675E',
    textMuted: '#9A9187',
    primary: '#1F3D33',
    onPrimary: '#FFFFFF',
    accent: '#B88A5A',
    danger: '#B3412E',
    success: '#2F7A4F',
    warning: '#B7791F',
    favorite: '#C8553D',
    overlay: 'rgba(20, 18, 15, 0.45)',
  },
  dark: {
    background: '#121110',
    surface: '#1C1A18',
    surfaceMuted: '#262320',
    border: '#34302B',
    text: '#F4EFE8',
    textSecondary: '#B9B0A5',
    textMuted: '#8A8178',
    primary: '#A9C5B4',
    onPrimary: '#10201A',
    accent: '#D2A877',
    danger: '#E07A66',
    success: '#7BC49A',
    warning: '#E0B060',
    favorite: '#E9785F',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const Shadow = Platform.select({
  web: { boxShadow: '0 6px 20px rgba(30, 25, 20, 0.08)' },
  default: {
    shadowColor: '#2B241C',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});

export const MaxContentWidth = 800;
