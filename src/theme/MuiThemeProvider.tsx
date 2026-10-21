import { CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { type ColorScheme } from '@/app/theme';
import { createCalendarTheme } from '@/theme/m3Theme';

function schemeFromDocument(): ColorScheme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('pf-v6-theme-dark')
    ? 'dark'
    : 'light';
}

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorScheme>(schemeFromDocument);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setMode(schemeFromDocument()));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const theme = useMemo(() => createCalendarTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
