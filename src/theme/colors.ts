export const colors = {
  primary: '#A49EE4',
  secondary: '#F9D770',
  background: '#F9F9F9',
  white: '#FFFFFF',
  textPrimary: '#1F2933',
  textSecondary: '#6B7280',
  muted: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.08)',
} as const;

export type ColorKey = keyof typeof colors;


