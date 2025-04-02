export const theme = {
  colors: {
    primary: '#4A6FFF',
    secondary: '#9747FF',
    background: '#FFFFFF',
    surface: '#F7F9FC',
    text: {
      primary: '#1A1D23',
      secondary: '#4E5968',
      tertiary: '#8D96A8',
    },
    message: {
      user: '#F0F4FF',
      ai: '#FFFFFF',
      system: '#F5F5F5',
    },
    status: {
      success: '#00C853',
      warning: '#FFB547',
      error: '#FF5252',
      info: '#2196F3',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    heading: {
      h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
      h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    },
    body: {
      regular: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
      small: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
      tiny: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },
    },
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    pill: '999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
    md: '0 4px 6px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.05)',
  },
  transitions: {
    quick: '0.15s ease',
    default: '0.25s ease',
    slow: '0.4s ease',
  },
} as const

// Create type from theme object
export type Theme = typeof theme

// Type for styled-components
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
