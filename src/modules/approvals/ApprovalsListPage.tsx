import { Alert } from '@mui/material';
import { PageContainer } from '../../components/PageContainer';

export function ApprovalsListPage() {
  return (
    <PageContainer title="Approvals">
      <Alert severity="info">No pending approvals yet — this module is a placeholder.</Alert>
    </PageContainer>
  );
}
