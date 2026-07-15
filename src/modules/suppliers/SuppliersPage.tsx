import { Paper } from '@mui/material';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';

export function SuppliersPage() {
  return (
    <PageContainer title="Suppliers">
      <Paper>
        <EmptyState
          title="Supplier management is coming soon"
          description="Supplier records already back the RFQ and PO workflows — a dedicated directory view will land in a future update."
        />
      </Paper>
    </PageContainer>
  );
}
