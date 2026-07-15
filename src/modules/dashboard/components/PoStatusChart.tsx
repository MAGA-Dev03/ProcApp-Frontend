import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { PoStatus } from '../../../types/purchaseOrder';

const STATUS_ORDER: { status: PoStatus; label: string }[] = [
  { status: 'draft', label: 'Draft' },
  { status: 'pendingApproval', label: 'Pending Approval' },
  { status: 'approved', label: 'Approved' },
  { status: 'issued', label: 'Issued' },
  { status: 'rejected', label: 'Rejected' },
];

interface PoStatusChartProps {
  counts: Record<PoStatus, number>;
}

export function PoStatusChart({ counts }: PoStatusChartProps) {
  const theme = useTheme();
  const maxCount = Math.max(1, ...STATUS_ORDER.map((s) => counts[s.status]));

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
      <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2.5 }}>Purchase Orders by Status</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {STATUS_ORDER.map(({ status, label }) => {
          const count = counts[status] ?? 0;
          const widthPct = (count / maxCount) * 100;
          const color = theme.palette.status[status].fg;

          return (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: 13, width: { xs: 96, sm: 128 }, flexShrink: 0, color: 'text.secondary' }}>
                {label}
              </Typography>
              <Box sx={{ flex: 1, height: 16, position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '4px',
                    backgroundColor: 'action.hover',
                  }}
                />
                {count > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: `${widthPct}%`,
                      minWidth: 4,
                      backgroundColor: color,
                      borderRadius: '0 4px 4px 0',
                    }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                  width: 24,
                  textAlign: 'right',
                  flexShrink: 0,
                  color: 'text.primary',
                }}
              >
                {count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
