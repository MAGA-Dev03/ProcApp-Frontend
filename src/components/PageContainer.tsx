import type { ReactNode } from 'react';
import { Container, Stack } from '@mui/material';
import { PageHeader } from './PageHeader';

interface PageContainerProps {
  title: string;
  meta?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageContainer({ title, meta, actions, children }: PageContainerProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <PageHeader title={title} meta={meta} actions={actions} />
      <Stack spacing={3}>{children}</Stack>
    </Container>
  );
}
