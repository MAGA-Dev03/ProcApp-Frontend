import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface RecordPageContainerProps {
  maxWidth?: number;
  backTo: string;
  backLabel: string;
  children: ReactNode;
}

/**
 * Shared shell for single-record pages (RFQ/PO detail and create) so every one
 * gets the same reading width, padding, and back-navigation link.
 */
export function RecordPageContainer({ maxWidth = 860, backTo, backLabel, children }: RecordPageContainerProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth, mx: 'auto', p: { xs: 3, sm: 5 } }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={() => navigate(backTo)}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        {backLabel}
      </Button>
      {children}
    </Box>
  );
}
