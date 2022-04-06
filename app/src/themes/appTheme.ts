import 'styles.scss';
import { createMuiTheme } from '@material-ui/core';

const appTheme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1600
    }
  },
  palette: {
    // https://material-ui.com/customization/palette/
    background: {
      default: '#fafafa'
    },
    primary: {
      light: '#5469a4',
      main: '#003366', // BC ID: corporate blue
      dark: '#001949',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#D8292F'
    },
    text: {
      primary: '#313132',
      secondary: '#575759'
    }
  },
  typography: {
    fontFamily: ['BCSans', 'Verdana', 'Arial', 'sans-serif'].join(',')
  },
  overrides: {
    MuiTypography: {
      // https://material-ui.com/api/typography/
      h1: {
        letterSpacing: '-0.02rem',
        fontSize: '2rem',
        fontWeight: 700
      },
      h2: {
        letterSpacing: '-0.01rem',
        fontSize: '1.25rem',
        fontWeight: 700
      },
      h3: {
        fontSize: '1rem',
        fontWeight: 700
      },
      h4: {
        fontSize: '1rem',
        fontWeight: 700
      },
      h6: {
        letterSpacing: '-0.01rem',
        fontWeight: 700
      }
    },
    MuiAlert: {
      root: {
        alignItems: 'center',
        fontSize: '1rem'
      }
    },
    MuiButton: {
      root: {
        textTransform: 'none'
      },
      outlinedPrimary: {
        backgroundColor: '#ffffff',
        '&:hover': {
          backgroundColor: '#ffffff'
        }
      },
      endIcon: {
        marginLeft: '4px'
      }
    },
    MuiContainer: {
      // https://material-ui.com/api/container/
      root: {
        maxWidth: 'xl',
        margin: 'auto'
      }
    },
    MuiChip: {
      labelSmall: {
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase'
      }
    },
    MuiDialog: {
      paperWidthXl: {
        width: '800px'
      }
    },
    MuiDialogContent: {
      root: {
        paddingTop: 0
      }
    },
    MuiDialogTitle: {
      root: {
        padding: '20px 24px'
      }
    },
    MuiDialogActions: {
      root: {
        padding: '20px 24px'
      }
    },
    MuiLink: {
      root: {
        textAlign: 'left',
        color: '#1a5a96',
        cursor: 'pointer'
      }
    },
    MuiLinearProgress: {
      root: {
        height: '6px',
        borderRadius: '3px'
      }
    },
    MuiListItemIcon: {
      root: {
        minWidth: '42px'
      }
    },
    MuiOutlinedInput: {
      root: {
        background: '#f6f6f6'
      }
    },
    MuiFilledInput: {
      root: {
        background: '#f6f6f6'
      }
    },
    MuiStepper: {
      root: {
        padding: 0
      }
    },
    MuiStep: {
      root: {
        cursor: 'pointer'
      }
    },
    MuiStepLabel: {
      active: {
        color: '#003366 !important'
      }
    },
    MuiStepIcon: {
      root: {
        marginLeft: '1rem',
        marginRight: '1rem',
        zIndex: 999,
        color: '#999999',
        fontSize: '33px',
        borderRadius: '50%',
        '&.Mui-error': {
          backgroundColor: '#ffffff',
          border: '3px solid red',
          color: 'red'
        }
      },
      text: {
        fontWeight: 700,
        fontSize: '0.35em'
      },
      active: {
        borderColor: '#003366',
        color: '#ffffff'
      },
      completed: {
        backgroundColor: '#ffffff',
        border: '3px solid #003366',
        padding: '2px',
        color: '#003366'
      }
    },
    MuiStepConnector: {
      vertical: {
        marginLeft: '32px',
        paddingBottom: 0
      },
      lineVertical: {
        borderLeftWidth: '2px'
      }
    },
    MuiTableCell: {
      root: {
        '&:first-child': {
          paddingLeft: '24px'
        },
        '&:last-child': {
          paddingRight: '24px'
        }
      },
      head: {
        backgroundColor: '#f0f0f0',
        lineHeight: 'normal',
        letterSpacing: '0.02rem',
        textTransform: 'uppercase',
        fontSize: '12px',
        fontWeight: 700
      },
      stickyHeader: {
        backgroundColor: '#f0f0f0'
      }
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        minWidth: '100px !important',
        fontWeight: 700
      }
    }
  }
});

export default appTheme;
