export const theme = {
  colors: {
    primary: '#6366F1', // Indigo
    primaryDark: '#4F46E5',
    primaryLight: '#A5B4FC',
    secondary: '#8B5CF6', // Violet
    secondaryDark: '#7C3AED',
    secondaryLight: '#C4B5FD',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceVariant: '#F3F4F6',
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#3B82F6', // Blue
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#9CA3AF',
      onPrimary: '#FFFFFF',
      onSecondary: '#FFFFFF',
      disabled: '#D1D5DB',
    },
    message: {
      user: '#EEF2FF', // Indigo 50
      userBorder: '#E0E7FF', // Indigo 100
      ai: '#FFFFFF',
      aiBorder: '#F3F4F6', // Gray 100
      system: '#F3F4F6', // Gray 100
      systemBorder: '#E5E7EB', // Gray 200
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    divider: '#E5E7EB', // Gray 200
  },
  spacing: {
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading: {
      h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
      h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
      h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    },
    body: {
      regular: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
      small: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
      tiny: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },
    },
  },
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
    circular: '50%',
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    md: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.06)',
    lg: '0 10px 15px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.05)',
    xl: '0 20px 25px rgba(0,0,0,0.03), 0 8px 10px rgba(0,0,0,0.04)',
    inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
    focus: '0 0 0 3px rgba(99, 102, 241, 0.4)', // Based on primary color
  },
  transitions: {
    quick: '0.15s ease',
    default: '0.25s ease',
    slow: '0.4s ease',
  },
  zIndices: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1700,
    tooltip: 1800,
  },
} as const

// Create type from theme object
export type Theme = typeof theme

// Type for styled-components
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
