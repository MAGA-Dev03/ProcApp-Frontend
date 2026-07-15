import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Box,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageContainer } from '../../components/PageContainer';
import { StatusPill } from '../../components/StatusPill';
import { EmptyState } from '../../components/EmptyState';
import { ClickableTableRow } from '../../components/ClickableTableRow';
import { usePurchaseOrders } from '../../services/purchaseOrders';
import { useApprovals } from '../../services/approvals';
import { useSuppliers } from '../../services/suppliers';
import { useProjects } from '../../services/projects';
import { getCurrentStepSummary } from './approvalChain';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
});

export function PoListPage() {
  const navigate = useNavigate();
  const { data: purchaseOrders, isLoading, isError } = usePurchaseOrders();
  const { data: approvals } = useApprovals();
  const { data: suppliers } = useSuppliers();
  const { data: projects } = useProjects();

  const rows = useMemo(() => {
    if (!purchaseOrders) return [];
    return purchaseOrders.map((po) => {
      const poApprovals = approvals?.filter((a) => a.poId === po.id) ?? [];
      return {
        po,
        supplierName: suppliers?.find((s) => s.id === po.supplierId)?.name ?? po.supplierId,
        projectName: projects?.find((p) => p.id === po.projectId)?.name ?? po.projectId,
        step: getCurrentStepSummary(po.status, poApprovals),
      };
    });
  }, [purchaseOrders, approvals, suppliers, projects]);

  const newPoButton = (
    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/po/new')}>
      New PO
    </Button>
  );

  return (
    <PageContainer
      title="Purchase Orders"
      meta={purchaseOrders ? `${purchaseOrders.length} POs` : undefined}
      actions={newPoButton}
    >
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {isError && <Alert severity="error">Failed to load purchase orders.</Alert>}

      {purchaseOrders && purchaseOrders.length === 0 && (
        <Paper>
          <EmptyState
            title="No purchase orders yet — create one to get started"
            description="Once an RFQ has a winning supplier, create a PO from it to start the approval process."
            action={newPoButton}
          />
        </Paper>
      )}

      {purchaseOrders && purchaseOrders.length > 0 && (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>PO ID</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Step</TableCell>
                <TableCell align="right">Total Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ po, supplierName, projectName, step }) => (
                <ClickableTableRow key={po.id} onActivate={() => navigate(`/po/${po.id}`)}>
                  <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {po.id}
                  </TableCell>
                  <TableCell>{supplierName}</TableCell>
                  <TableCell>{projectName}</TableCell>
                  <TableCell>
                    <StatusPill status={po.status} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13.5, color: step.tone === 'blocked' ? 'error.main' : 'text.primary' }}>
                      {step.label}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {currencyFormatter.format(po.totalValue)}
                  </TableCell>
                </ClickableTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
}
