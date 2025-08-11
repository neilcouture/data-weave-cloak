import { createTheme, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Healthcare Design System Theme
const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as const,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, hsl(203, 94%, 25%) 0%, hsl(203, 94%, 35%) 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, hsl(203, 94%, 20%) 0%, hsl(203, 94%, 30%) 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'hsl(203, 94%, 35%)',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'hsl(203, 94%, 25%)',
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
  },
};

export const lightTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(203, 94%, 25%)',
      light: 'hsl(203, 94%, 35%)',
      dark: 'hsl(203, 94%, 15%)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'hsl(149, 46%, 45%)',
      light: 'hsl(149, 46%, 55%)',
      dark: 'hsl(149, 46%, 35%)',
      contrastText: '#ffffff',
    },
    error: {
      main: 'hsl(0, 84%, 60%)',
      light: 'hsl(0, 84%, 70%)',
      dark: 'hsl(0, 84%, 50%)',
    },
    warning: {
      main: 'hsl(45, 100%, 51%)',
      light: 'hsl(45, 100%, 61%)',
      dark: 'hsl(45, 100%, 41%)',
    },
    success: {
      main: 'hsl(142, 71%, 45%)',
      light: 'hsl(142, 71%, 55%)',
      dark: 'hsl(142, 71%, 35%)',
    },
    background: {
      default: 'hsl(0, 0%, 100%)',
      paper: 'hsl(210, 20%, 98%)',
    },
    text: {
      primary: 'hsl(210, 11%, 15%)',
      secondary: 'hsl(210, 9%, 31%)',
      disabled: 'hsl(210, 9%, 71%)',
    },
    divider: 'hsl(210, 20%, 90%)',
  },
};

export const darkTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: 'hsl(203, 94%, 55%)',
      light: 'hsl(203, 94%, 65%)',
      dark: 'hsl(203, 94%, 35%)',
      contrastText: 'hsl(210, 11%, 15%)',
    },
    secondary: {
      main: 'hsl(149, 46%, 55%)',
      light: 'hsl(149, 46%, 65%)',
      dark: 'hsl(149, 46%, 45%)',
      contrastText: 'hsl(210, 11%, 15%)',
    },
    error: {
      main: 'hsl(0, 84%, 60%)',
      light: 'hsl(0, 84%, 70%)',
      dark: 'hsl(0, 84%, 50%)',
    },
    warning: {
      main: 'hsl(45, 100%, 51%)',
      light: 'hsl(45, 100%, 61%)',
      dark: 'hsl(45, 100%, 41%)',
    },
    success: {
      main: 'hsl(142, 71%, 55%)',
      light: 'hsl(142, 71%, 65%)',
      dark: 'hsl(142, 71%, 45%)',
    },
    background: {
      default: 'hsl(210, 15%, 7%)',
      paper: 'hsl(210, 15%, 9%)',
    },
    text: {
      primary: 'hsl(210, 20%, 95%)',
      secondary: 'hsl(210, 15%, 85%)',
      disabled: 'hsl(210, 10%, 45%)',
    },
    divider: 'hsl(210, 15%, 15%)',
  },
  components: {
    ...baseTheme.components,
    MuiButton: {
      ...baseTheme.components?.MuiButton,
      styleOverrides: {
        ...baseTheme.components?.MuiButton?.styleOverrides,
        containedPrimary: {
          background: 'linear-gradient(135deg, hsl(203, 94%, 55%) 0%, hsl(203, 94%, 65%) 100%)',
          color: 'hsl(210, 11%, 15%)',
          '&:hover': {
            background: 'linear-gradient(135deg, hsl(203, 94%, 50%) 0%, hsl(203, 94%, 60%) 100%)',
          },
        },
      },
    },
  },
};

export const createAppTheme = (isDarkMode: boolean) => {
  return createTheme(isDarkMode ? darkTheme : lightTheme);
};