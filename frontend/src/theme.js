import { createTheme, alpha } from '@mui/material/styles';

// ─── Minimal B&W Design Tokens ──────────────────────────────────────────────
const tokens = {
  // Core palette — pure black & white
  black: '#000000',
  darkSurface: '#0A0A0A',
  cardDark: '#111111',
  cardDarkHover: '#1A1A1A',
  borderDark: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderGlow: 'rgba(255, 255, 255, 0.2)',
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textTertiary: '#666666',

  // Functional colors (minimal usage)
  blue: '#FFFFFF',
  blueLight: '#FFFFFF',
  blueDark: '#E0E0E0',
  green: '#FFFFFF',
  greenLight: '#FFFFFF',
  greenDark: '#CCCCCC',
  red: '#FF4444',
  redLight: '#FF6666',
  redDark: '#CC3333',
  amber: '#CCCCCC',
  amberLight: '#DDDDDD',
  amberDark: '#AAAAAA',
  purple: '#CCCCCC',
  purpleLight: '#DDDDDD',
  purpleDark: '#AAAAAA',
  cyan: '#CCCCCC',
  cyanLight: '#DDDDDD',

  // Surface
  glassBackground: '#111111',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHover: '#1A1A1A',
  glassStrong: '#161616',

  // Radii — subtle rounding
  radiusSm: 4,
  radiusMd: 6,
  radiusLg: 8,
  radiusXl: 10,
  radiusFull: 9999,

  // Animations — kept minimal
  springBezier: 'ease',
  smoothBezier: 'ease',
  easeBezier: 'ease',
};

// ─── Reusable Card Styles (flat, no glass) ──────────────────────────────────
export const glassCard = {
  background: tokens.cardDark,
  border: `1px solid ${tokens.borderDark}`,
  borderRadius: tokens.radiusMd,
  transition: 'background 0.15s ease',
  '&:hover': {
    background: tokens.cardDarkHover,
  },
};

export const glassCardStatic = {
  background: tokens.cardDark,
  border: `1px solid ${tokens.borderDark}`,
  borderRadius: tokens.radiusMd,
};

export const glowText = (color) => ({
  color,
});

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#CCCCCC',
      contrastText: '#000000',
    },
    secondary: {
      main: '#999999',
      light: '#BBBBBB',
      dark: '#777777',
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#111111',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#999999',
      disabled: '#555555',
    },
    divider: tokens.borderDark,
    success: { main: '#FFFFFF', light: '#FFFFFF', dark: '#CCCCCC' },
    warning: { main: '#CCCCCC', light: '#DDDDDD', dark: '#AAAAAA' },
    error: { main: '#FF4444', light: '#FF6666', dark: '#CC3333' },
    info: { main: '#CCCCCC', light: '#DDDDDD', dark: '#AAAAAA' },
  },

  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' },
    h2: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.15, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, fontSize: '1.35rem', lineHeight: 1.2, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, fontSize: '1.15rem', lineHeight: 1.25 },
    h5: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 },
    h6: { fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.35 },
    subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none', fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.5, color: '#999999' },
    overline: {
      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: '#666666',
    },
  },

  shape: { borderRadius: 6 },

  shadows: [
    'none',
    ...Array(24).fill('none'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@import': "url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap')",
        '*, *::before, *::after': { boxSizing: 'border-box' },
        html: { scrollBehavior: 'smooth' },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          background: '#000000',
          minHeight: '100vh',
          overflowX: 'hidden',
        },
        '::-webkit-scrollbar': { width: 6 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.1)',
          '&:hover': { background: 'rgba(255,255,255,0.2)' },
        },
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        '@keyframes slideInLeft': {
          from: { opacity: 0, transform: 'translateX(-12px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes slideInRight': {
          from: { opacity: 0, transform: 'translateX(12px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes scaleIn': {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radiusSm,
          padding: '10px 22px',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.15s ease',
        },
        contained: {
          background: '#FFFFFF',
          color: '#000000',
          '&:hover': { background: '#E0E0E0' },
        },
        outlined: {
          borderColor: tokens.borderLight,
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
        },
        text: {
          color: '#999999',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: '#FFFFFF',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radiusMd,
          background: tokens.cardDark,
          border: `1px solid ${tokens.borderDark}`,
          boxShadow: 'none',
          transition: 'background 0.15s ease',
          '&:hover': {
            background: tokens.cardDarkHover,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: tokens.cardDark },
        rounded: { borderRadius: tokens.radiusMd },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${tokens.borderDark}`,
          backgroundColor: '#000000',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${tokens.borderDark}`,
          backgroundColor: '#0A0A0A',
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radiusSm,
          margin: '0 0',
          padding: '10px 16px',
          transition: 'all 0.1s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(255,255,255,0.06)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            '& .MuiListItemIcon-root': { color: '#FFFFFF' },
            '& .MuiListItemText-primary': { fontWeight: 600, color: '#FFFFFF' },
          },
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)',
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radiusSm,
            backgroundColor: 'transparent',
            '& fieldset': { borderColor: tokens.borderDark },
            '&:hover fieldset': { borderColor: tokens.borderLight },
            '&.Mui-focused fieldset': { borderColor: '#FFFFFF', borderWidth: 1 },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: tokens.radiusFull, fontWeight: 500, fontSize: '0.75rem' },
        filled: {
          '&.MuiChip-colorSuccess': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF' },
          '&.MuiChip-colorWarning': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#CCCCCC' },
          '&.MuiChip-colorError': { backgroundColor: 'rgba(255,68,68,0.1)', color: '#FF6666' },
          '&.MuiChip-colorInfo': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#CCCCCC' },
          '&.MuiChip-colorPrimary': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF' },
        },
        outlined: { borderColor: tokens.borderLight },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', backgroundColor: '#0A0A0A',
          color: '#666666', borderBottom: `1px solid ${tokens.borderDark}`,
        },
        root: { borderBottom: `1px solid ${tokens.borderDark}` },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radiusMd,
          border: `1px solid ${tokens.borderDark}`,
          background: tokens.cardDark,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 500, fontSize: '0.875rem',
          minHeight: 44, padding: '8px 18px', color: '#666666',
          '&.Mui-selected': { fontWeight: 600, color: '#FFFFFF' },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { height: 1, backgroundColor: '#FFFFFF' },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radiusLg,
          background: '#111111',
          border: `1px solid ${tokens.borderDark}`,
          boxShadow: 'none',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: tokens.radiusSm, fontSize: '0.75rem',
          backgroundColor: '#1A1A1A', padding: '8px 14px',
          border: `1px solid ${tokens.borderDark}`,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: tokens.radiusSm, padding: '14px 20px' },
        standardSuccess: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' },
        standardWarning: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#CCCCCC' },
        standardError: { backgroundColor: 'rgba(255,68,68,0.08)', color: '#FF6666' },
        standardInfo: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#CCCCCC' },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 600 },
        rounded: { borderRadius: tokens.radiusFull },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: tokens.radiusFull, height: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
        bar: { borderRadius: tokens.radiusFull },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: { width: 48, height: 28, padding: 0 },
        switchBase: {
          padding: 3,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': { backgroundColor: '#FFFFFF', opacity: 1 },
            '& .MuiSwitch-thumb': { backgroundColor: '#000000' },
          },
        },
        thumb: { width: 22, height: 22, boxShadow: 'none' },
        track: { borderRadius: tokens.radiusFull, backgroundColor: '#333333', opacity: 1 },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: tokens.borderDark } },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#999999',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFFFFF' },
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 700, fontSize: '0.625rem' },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radiusMd,
          backgroundColor: '#111111',
          border: `1px solid ${tokens.borderDark}`,
          boxShadow: 'none',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radiusSm, padding: '8px 16px',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radiusSm,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.borderDark },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.borderLight },
        },
      },
    },

    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': { color: '#FFFFFF' },
          },
        },
      },
    },
  },
});

export { tokens };
export default theme;
