import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { StatusTone } from '../app/tokens';

const labels: Record<StatusTone, string> = {
  draft: 'Draft',
  sent: 'Sent',
  responsesReceived: 'Responses Received',
  closed: 'Closed',
  pendingApproval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  issued: 'Issued',
  pending: 'Pending',
  submitted: 'Submitted',
  awarded: 'Awarded',
};

interface StatusPillProps {
  status: StatusTone;
}

export function StatusPill({ status }: StatusPillProps) {
  const theme = useTheme();
  const { fg, bg } = theme.palette.status[status];

  return (
    <Chip
      size="small"
      label={labels[status]}
      icon={
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: fg,
            ml: '8px',
          }}
        />
      }
      sx={{
        color: fg,
        backgroundColor: bg,
        '& .MuiChip-icon': { order: -1, marginRight: 0 },
        '& .MuiChip-label': { pl: '6px' },
      }}
    />
  );
}
