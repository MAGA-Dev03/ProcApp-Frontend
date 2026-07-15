import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { fonts } from '../app/tokens';

interface PageHeaderProps {
  title: string;
  meta?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, meta, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 3,
        flexWrap: 'wrap',
        borderBottom: 2,
        borderColor: 'text.primary',
        pb: 2.5,
        mb: 4,
      }}
    >
      <Box>
        <Typography
          component="h1"
          sx={{
            fontFamily: fonts.display,
            fontWeight: 400,
            fontSize: { xs: 26, sm: 30 },
            lineHeight: 1.15,
            textWrap: 'balance',
          }}
        >
          {title}
        </Typography>
        {meta && (
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {meta}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>{actions}</Box>}
    </Box>
  );
}
