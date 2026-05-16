export interface ThemeColors {
  background: string;
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  coral: string;
  mint: string;
  seaBlue: string;
  cardBg: string;
  baseBg: string;
}

export const DarkColors: ThemeColors = {
  background: '#161622',
  surface: '#161622',
  surfaceDim: '#161622',
  surfaceBright: '#3a3847',
  surfaceContainerLowest: '#111118',
  surfaceContainerLow: '#1e1e2e',
  surfaceContainer: '#252536',
  surfaceContainerHigh: '#2f2f42',
  surfaceContainerHighest: '#3a3a4e',
  surfaceVariant: '#3a3a4e',
  onSurface: '#ece8f4',
  onSurfaceVariant: '#c4c0d0',
  inverseSurface: '#ece8f4',
  inverseOnSurface: '#2f2f42',
  outline: '#928e9e',
  outlineVariant: '#4a4658',
  primary: '#c4b0ff',
  onPrimary: '#2d1a66',
  primaryContainer: '#5e4b99',
  onPrimaryContainer: '#e8dfff',
  secondary: '#c9bde6',
  onSecondary: '#332a4d',
  secondaryContainer: '#4d4468',
  onSecondaryContainer: '#bfb2d9',
  tertiary: '#ffd599',
  onTertiary: '#3e2e00',
  tertiaryContainer: '#c9a74d',
  onTertiaryContainer: '#503d00',
  error: '#ffb3b3',
  onError: '#660008',
  errorContainer: '#8f000a',
  onErrorContainer: '#ffd6d6',
  coral: '#ffb3b3',
  mint: '#a0e4cb',
  seaBlue: '#9dd1ea',
  cardBg: '#1e2040',
  baseBg: '#1a1a2e',
};

export const LightColors: ThemeColors = {
  background: '#faf7ff',
  surface: '#ffffff',
  surfaceDim: '#f0edf5',
  surfaceBright: '#faf7ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f1fa',
  surfaceContainer: '#efebf5',
  surfaceContainerHigh: '#e8e4f0',
  surfaceContainerHighest: '#e2def0',
  surfaceVariant: '#e2def0',
  onSurface: '#1c1b2e',
  onSurfaceVariant: '#4a4860',
  inverseSurface: '#2f2f42',
  inverseOnSurface: '#f5f1fa',
  outline: '#7b7890',
  outlineVariant: '#cac5d8',
  primary: '#7c5cbf',
  onPrimary: '#ffffff',
  primaryContainer: '#e8dfff',
  onPrimaryContainer: '#2d1a66',
  secondary: '#6e6590',
  onSecondary: '#ffffff',
  secondaryContainer: '#e8dfff',
  onSecondaryContainer: '#2a2140',
  tertiary: '#c49000',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffeab0',
  onTertiaryContainer: '#3d2e00',
  error: '#d44040',
  onError: '#ffffff',
  errorContainer: '#ffe0e0',
  onErrorContainer: '#660008',
  coral: '#e88888',
  mint: '#50b896',
  seaBlue: '#5aadcf',
  cardBg: '#f0ecf8',
  baseBg: '#f5f2fa',
};

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? DarkColors : LightColors;
}

export const Spacing = {
  xs: 4,
  base: 8,
  sm: 12,
  md: 24,
  lg: 40,
  xl: 64,
  safeMargin: 20,
};

export const BorderRadius = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Keep backward-compatible Colors for any imports that still use it
export const Colors = DarkColors;
