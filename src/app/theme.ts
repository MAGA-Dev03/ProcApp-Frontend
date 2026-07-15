import { createTheme } from '@mui/material/styles';
import { fonts, paletteTokens, statusTokens } from './tokens';
import type { StatusTone, ThemeMode } from './tokens';

declare module '@mui/material/styles' {
  interface Palette {
    status: Record<StatusTone, { fg: string; bg: string }>;
    surface: {
      raised: string;
    };
  }
  interface PaletteOptions {
    status: Record<StatusTone, { fg: string; bg: string }>;
    surface: {
      raised: string;
    };
  }
}

export function createAppTheme(mode: ThemeMode) {
  const tokens = paletteTokens[mode];
  const status = statusTokens[mode];

  return createTheme({
    palette: {
      mode,
      background: {
        default: tokens.paper,
        paper: tokens.paperRaised,
      },
      text: {
        primary: tokens.ink,
        secondary: tokens.slate,
      },
      divider: tokens.rule,
      primary: {
        main: tokens.accent,
        dark: tokens.accentDeep,
        contrastText: tokens.accentInk,
      },
      status,
      surface: {
        raised: tokens.paperRaised,
      },
    },
    shape: {
      borderRadius: 3,
    },
    typography: {
      fontFamily: fonts.body,
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            fontFeatureSettings: '"tnum" 1',
          },
          // !important: MUI's own component styles (ButtonBase, ListItemButton, etc.)
          // reset outline with higher specificity than a bare `*:focus-visible` rule.
          '*:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main} !important`,
            outlineOffset: '2px !important',
          },
        }),
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 3,
          },
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              backgroundColor: 'transparent',
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
        defaultProps: {
          elevation: 0,
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
          head: ({ theme }) => ({
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.surface.raised,
          }),
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:hover': {
              backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 6%, transparent)`,
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 3,
            fontWeight: 600,
            fontSize: 11.5,
            letterSpacing: '0.03em',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 3,
            '& fieldset': {
              borderColor: theme.palette.divider,
            },
          }),
        },
      },
    },
  });
}
