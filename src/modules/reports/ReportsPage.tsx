import { Paper } from '@mui/material';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';

export function ReportsPage() {
  return (
    <PageContainer title="Reports">
      <Paper>
        <EmptyState title="Reports are coming soon" description="Spend and cycle-time reporting will land in a future update." />
      </Paper>
    </PageContainer>
  );
}
