import { createTheme } from '@mui/material/styles';

// モダンで洗練されたテーマ設定
export const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5E72E4', // モダンな紫がかった青
      light: '#8B92F8',
      dark: '#3A4FBC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B9D', // 鮮やかなピンク
      light: '#FF8FB3',
      dark: '#E44D7A',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2DCE89',
      light: '#4FE3A1',
      dark: '#1FAF70',
    },
    warning: {
      main: '#FB6340',
      light: '#FC8567',
      dark: '#FA3A0E',
    },
    info: {
      main: '#11CDEF',
      light: '#3AD6F2',
      dark: '#0DA5C0',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#32325D',
      secondary: '#525F7F',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Noto Sans JP"',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 4px 6px rgba(50, 50, 93, 0.11), 0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 7px 14px rgba(50, 50, 93, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.08)',
    '0px 10px 20px rgba(50, 50, 93, 0.12), 0px 5px 10px rgba(0, 0, 0, 0.08)',
    '0px 13px 27px rgba(50, 50, 93, 0.13), 0px 7px 13px rgba(0, 0, 0, 0.08)',
    '0px 16px 32px rgba(50, 50, 93, 0.14), 0px 9px 16px rgba(0, 0, 0, 0.08)',
    '0px 20px 38px rgba(50, 50, 93, 0.15), 0px 11px 19px rgba(0, 0, 0, 0.08)',
    '0px 24px 45px rgba(50, 50, 93, 0.16), 0px 13px 22px rgba(0, 0, 0, 0.08)',
    '0px 28px 52px rgba(50, 50, 93, 0.17), 0px 15px 26px rgba(0, 0, 0, 0.08)',
    '0px 32px 59px rgba(50, 50, 93, 0.18), 0px 17px 29px rgba(0, 0, 0, 0.08)',
    '0px 36px 66px rgba(50, 50, 93, 0.19), 0px 19px 32px rgba(0, 0, 0, 0.08)',
    '0px 40px 73px rgba(50, 50, 93, 0.2), 0px 21px 35px rgba(0, 0, 0, 0.08)',
    '0px 44px 80px rgba(50, 50, 93, 0.21), 0px 23px 38px rgba(0, 0, 0, 0.08)',
    '0px 48px 87px rgba(50, 50, 93, 0.22), 0px 25px 41px rgba(0, 0, 0, 0.08)',
    '0px 52px 94px rgba(50, 50, 93, 0.23), 0px 27px 44px rgba(0, 0, 0, 0.08)',
    '0px 56px 101px rgba(50, 50, 93, 0.24), 0px 29px 47px rgba(0, 0, 0, 0.08)',
    '0px 60px 108px rgba(50, 50, 93, 0.25), 0px 31px 50px rgba(0, 0, 0, 0.08)',
    '0px 64px 115px rgba(50, 50, 93, 0.26), 0px 33px 53px rgba(0, 0, 0, 0.08)',
    '0px 68px 122px rgba(50, 50, 93, 0.27), 0px 35px 56px rgba(0, 0, 0, 0.08)',
    '0px 72px 129px rgba(50, 50, 93, 0.28), 0px 37px 59px rgba(0, 0, 0, 0.08)',
    '0px 76px 136px rgba(50, 50, 93, 0.29), 0px 39px 62px rgba(0, 0, 0, 0.08)',
    '0px 80px 143px rgba(50, 50, 93, 0.3), 0px 41px 65px rgba(0, 0, 0, 0.08)',
    '0px 84px 150px rgba(50, 50, 93, 0.31), 0px 43px 68px rgba(0, 0, 0, 0.08)',
    '0px 88px 157px rgba(50, 50, 93, 0.32), 0px 45px 71px rgba(0, 0, 0, 0.08)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0px 4px 6px rgba(50, 50, 93, 0.11), 0px 1px 3px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 7px 14px rgba(50, 50, 93, 0.15), 0px 3px 6px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6c4199 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0px 10px 30px rgba(50, 50, 93, 0.12), 0px 5px 15px rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 20px 40px rgba(50, 50, 93, 0.18), 0px 10px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 10px 30px rgba(50, 50, 93, 0.12), 0px 5px 15px rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(50, 50, 93, 0.1)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 12px rgba(94, 114, 228, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          color: '#FFFFFF',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
        },
        head: {
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#FFFFFF',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 8px 24px rgba(50, 50, 93, 0.25), 0px 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1) rotate(10deg)',
            boxShadow: '0px 12px 32px rgba(50, 50, 93, 0.3), 0px 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// レスポンシブヘルパー
export const responsive = {
  isMobile: '@media (max-width: 599px)',
  isTablet: '@media (min-width: 600px) and (max-width: 959px)',
  isDesktop: '@media (min-width: 960px)',
  isLargeDesktop: '@media (min-width: 1280px)',
};