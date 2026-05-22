/**
 * Tiny design tokens shared across mobile screens. Keeping it inline rather
 * than pulling a UI lib so the bundle stays small and we control the look
 * end-to-end. Pair with `useColorScheme()` for dark mode.
 */
export const palette = {
  light: {
    bg: '#ffffff',
    bgMuted: '#f6f6f7',
    surface: '#ffffff',
    border: '#e4e4e7',
    borderStrong: '#d4d4d8',
    text: '#0a0a0a',
    textMuted: '#52525b',
    textSubtle: '#a1a1aa',
    primary: '#2563EB',
    primaryFg: '#ffffff',
    accent: '#2563eb',
    accentFg: '#ffffff',
    success: '#16a34a',
    danger: '#dc2626',
    dangerBg: '#fef2f2',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    bg: '#0a0a0a',
    bgMuted: '#111113',
    surface: '#161618',
    border: '#27272a',
    borderStrong: '#3f3f46',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    textSubtle: '#71717a',
    primary: '#fafafa',
    primaryFg: '#0a0a0a',
    accent: '#60a5fa',
    accentFg: '#0a0a0a',
    success: '#4ade80',
    danger: '#f87171',
    dangerBg: '#2a1414',
    overlay: 'rgba(0,0,0,0.65)',
  },
}

export type Theme = (typeof palette)['light']

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const typography = {
  display: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.2 },
}
