import type { ReactNode } from 'react';
import { Container, Typography, Stack } from '@mui/material';

interface PageContainerProps {
  title: string;
  children: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {children}
      </Stack>
    </Container>
  );
}
