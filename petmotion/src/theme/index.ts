/**
 * PetMotion theme — dark-first, playful, high-contrast.
 * Kept intentionally small; import { theme } everywhere.
 */
export const colors = {
  bg: '#0B0B12',
  bgElevated: '#15151F',
  surface: '#1D1D2B',
  border: '#2A2A3C',
  primary: '#7C5CFF',
  primaryPressed: '#6A48F0',
  accent: '#FF5CA8',
  success: '#3DD68C',
  danger: '#FF5C5C',
  text: '#F5F5FA',
  textMuted: '#9A9AB2',
  textFaint: '#5E5E77',
  onPrimary: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 30, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  title: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
} as const;

export const theme = { colors, spacing, radius, typography };
export default theme;
