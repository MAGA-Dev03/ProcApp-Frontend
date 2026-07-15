import { Paper } from '@mui/material';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';

export function ProjectsPage() {
  return (
    <PageContainer title="Projects">
      <Paper>
        <EmptyState
          title="Project management is coming soon"
          description="Projects already back the RFQ and PO workflows — a dedicated view will land in a future update."
        />
      </Paper>
    </PageContainer>
  );
}
