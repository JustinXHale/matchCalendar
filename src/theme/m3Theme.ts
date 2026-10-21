import { createTheme, type PaletteMode, type ThemeOptions } from '@mui/material/styles';

const palette = {
  black: '#000000',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray950: '#141414',
  grayBorder: '#333333',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#ca8a04',
} as const;

declare module '@mui/material/styles' {
  interface Palette {
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
  }
  interface PaletteOptions {
    surfaceContainerLow?: string;
    surfaceContainer?: string;
    surfaceContainerHigh?: string;
    onSurfaceVariant?: string;
    outline?: string;
    outlineVariant?: string;
  }
}

function themeOptions(mode: PaletteMode): ThemeOptions {
  const dark = mode === 'dark';
  const ink = dark ? palette.white : palette.black;
  const surface = dark ? palette.black : palette.white;
  const background = dark ? palette.black : palette.gray50;
  const mutedSurface = dark ? palette.gray950 : palette.gray100;
  const border = dark ? palette.grayBorder : palette.gray200;

  return {
    palette: {
      mode,
      primary: { main: ink, contrastText: dark ? palette.black : palette.white },
      secondary: { main: palette.gray600, contrastText: palette.white },
      error: { main: palette.red, contrastText: palette.white },
      warning: { main: palette.yellow, contrastText: palette.black },
      success: { main: palette.green, contrastText: palette.white },
      background: { default: background, paper: surface },
      text: { primary: ink, secondary: dark ? palette.gray200 : palette.gray600 },
      divider: border,
      surfaceContainerLow: surface,
      surfaceContainer: mutedSurface,
      surfaceContainerHigh: mutedSurface,
      onSurfaceVariant: dark ? palette.gray200 : palette.gray600,
      outline: dark ? palette.gray200 : palette.gray600,
      outlineVariant: border,
    },
    typography: {
      fontFamily: "'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif",
      h1: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 },
      h2: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3 },
      h3: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.45 },
      body2: { fontSize: '0.875rem', lineHeight: 1.4 },
      caption: { fontSize: '0.75rem', lineHeight: 1.35 },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            minHeight: 48,
            minWidth: 48,
            paddingInline: 16,
            borderRadius: 8,
            boxShadow: 'none',
          },
        },
      },
      MuiIconButton: { styleOverrides: { root: { width: 48, height: 48 } } },
      MuiInputBase: {
        styleOverrides: {
          root: { minHeight: 48 },
          input: { minHeight: 48, boxSizing: 'border-box' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            minHeight: 48,
            borderRadius: 8,
            backgroundColor: surface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: dark ? palette.gray200 : palette.gray600 },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ink },
          },
          input: { minHeight: 48, boxSizing: 'border-box', padding: '12px 14px' },
          multiline: { alignItems: 'flex-start', padding: 0, minHeight: 48 },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { color: ink, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 },
        },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { marginInline: 0, fontSize: '0.75rem', lineHeight: 1.35 } },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: 'transparent' },
          'a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, [role="button"]:focus-visible': {
            outline: `2px solid ${ink}`,
            outlineOffset: 2,
          },
        },
      },
    },
  };
}

export function createCalendarTheme(mode: PaletteMode = 'light') {
  return createTheme(themeOptions(mode));
}
