import { Box } from '@mui/material';

export function PrototypeBanner() {
  return (
    <Box
      sx={{
        py: 0.5,
        px: 2,
        textAlign: 'center',
        backgroundColor: 'status.pending.bg',
        color: 'status.pending.fg',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      Prototype — mock data, no backend
    </Box>
  );
}
