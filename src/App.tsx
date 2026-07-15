import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/router';
import { createAppTheme } from './app/theme';
import { queryClient } from './app/queryClient';
import { ColorModeProvider, useColorMode } from './app/ColorModeContext';
import { RoleProvider } from './app/RoleContext';

function ThemedApp() {
  const { mode } = useColorMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider>
        <RoleProvider>
          <ThemedApp />
        </RoleProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  );
}

export default App;
