import { Paper, Typography, Box } from '@mui/material';

interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
}

export function StatTile({ label, value, caption }: StatTileProps) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography
        sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 600, mt: 1, lineHeight: 1.1 }}>{value}</Typography>
      {caption && (
        <Box sx={{ mt: 0.75 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{caption}</Typography>
        </Box>
      )}
    </Paper>
  );
}
