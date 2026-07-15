import { useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { PageContainer } from '../../components/PageContainer';
import { useRfqs } from '../../services/rfqs';
import { usePurchaseOrders } from '../../services/purchaseOrders';
import { useMyPendingApprovals } from '../po/useMyPendingApprovals';
import { useRole, ROLE_LABELS } from '../../app/RoleContext';
import { StatTile } from './components/StatTile';
import { PoStatusChart } from './components/PoStatusChart';
import type { PoStatus } from '../../types/purchaseOrder';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const EMPTY_STATUS_COUNTS: Record<PoStatus, number> = {
  draft: 0,
  pendingApproval: 0,
  approved: 0,
  rejected: 0,
  issued: 0,
};

export function DashboardPage() {
  const { role } = useRole();
  const { data: rfqs, isLoading: isLoadingRfqs, isError: isErrorRfqs } = useRfqs();
  const { data: purchaseOrders, isLoading: isLoadingPos, isError: isErrorPos } = usePurchaseOrders();
  const { rows: pendingApprovalRows, isLoading: isLoadingApprovals, isError: isErrorApprovals } = useMyPendingApprovals();

  const isLoading = isLoadingRfqs || isLoadingPos || isLoadingApprovals;
  const isError = isErrorRfqs || isErrorPos || isErrorApprovals;

  const openRfqsCount = useMemo(() => rfqs?.filter((rfq) => rfq.status !== 'closed').length ?? 0, [rfqs]);

  const totalPoValueThisMonth = useMemo(() => {
    if (!purchaseOrders) return 0;
    const monthPrefix = new Date().toISOString().slice(0, 7);
    return purchaseOrders
      .filter((po) => po.createdDate.startsWith(monthPrefix))
      .reduce((sum, po) => sum + po.totalValue, 0);
  }, [purchaseOrders]);

  const poStatusCounts = useMemo(() => {
    if (!purchaseOrders) return EMPTY_STATUS_COUNTS;
    return purchaseOrders.reduce(
      (counts, po) => {
        counts[po.status] += 1;
        return counts;
      },
      { ...EMPTY_STATUS_COUNTS },
    );
  }, [purchaseOrders]);

  return (
    <PageContainer title="Dashboard" meta={`Viewing as ${ROLE_LABELS[role]}`}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {isError && <Alert severity="error">Failed to load dashboard data.</Alert>}

      {!isLoading && !isError && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            <StatTile label="Open RFQs" value={String(openRfqsCount)} caption="Draft, sent, or awaiting responses" />
            <StatTile
              label="Pending Your Approval"
              value={String(pendingApprovalRows.length)}
              caption={`As ${ROLE_LABELS[role]}`}
            />
            <StatTile
              label="Total PO Value This Month"
              value={currencyFormatter.format(totalPoValueThisMonth)}
              caption={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
          </Box>

          <PoStatusChart counts={poStatusCounts} />
        </>
      )}
    </PageContainer>
  );
}
