import { Alert } from '@mui/material';
import { PageContainer } from '../../components/PageContainer';

export function PoListPage() {
  return (
    <PageContainer title="Purchase Orders">
      <Alert severity="info">No purchase orders yet — this module is a placeholder.</Alert>
    </PageContainer>
  );
}
