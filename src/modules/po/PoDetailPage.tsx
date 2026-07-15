import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Stack,
  Link,
} from '@mui/material';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/StatusPill';
import { EmptyState } from '../../components/EmptyState';
import { RecordPageContainer } from '../../components/RecordPageContainer';
import { usePurchaseOrder } from '../../services/purchaseOrders';
import { useApprovals } from '../../services/approvals';
import { useUsers } from '../../services/userService';
import { useProjects } from '../../services/projects';
import { useSuppliers } from '../../services/suppliers';
import { ApprovalStepper } from './components/ApprovalStepper';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
});

export function PoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: po, isLoading, isError } = usePurchaseOrder(id);
  const { data: approvals, isLoading: isLoadingApprovals } = useApprovals({ poId: id });
  const { data: users } = useUsers();
  const { data: projects } = useProjects();
  const { data: suppliers } = useSuppliers();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError || !po) {
    return (
      <RecordPageContainer maxWidth={960} backTo="/po" backLabel="Back to Purchase Orders">
        <Alert severity="error">Purchase order not found.</Alert>
      </RecordPageContainer>
    );
  }

  const supplier = suppliers?.find((s) => s.id === po.supplierId);
  const project = projects?.find((p) => p.id === po.projectId);

  return (
    <RecordPageContainer maxWidth={960} backTo="/po" backLabel="Back to Purchase Orders">
      <PageHeader
        title={supplier?.name ?? po.supplierId}
        meta={`${po.id} · ${project?.name ?? po.projectId}`}
        actions={<StatusPill status={po.status} />}
      />

      <Stack spacing={4}>
        <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Linked RFQ
              </Typography>
              <Link component={RouterLink} to={`/rfq/${po.rfqId}`} sx={{ fontSize: 14, mt: 0.75, display: 'block' }}>
                {po.rfqId}
              </Link>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Created
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 0.75, fontVariantNumeric: 'tabular-nums' }}>{po.createdDate}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Issued
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 0.75, fontVariantNumeric: 'tabular-nums' }}>{po.issuedDate ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Total Value
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 0.75, fontVariantNumeric: 'tabular-nums' }}>
                {currencyFormatter.format(po.totalValue)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1.5 }}>Line Items</Typography>
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {po.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {currencyFormatter.format(item.unitPrice)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {currencyFormatter.format(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 600, border: 0 }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', border: 0 }}>
                    {currencyFormatter.format(po.totalValue)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2.5 }}>Approval Chain</Typography>
          <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {po.status === 'draft' ? (
              <EmptyState
                compact
                title="Not submitted for approval"
                description="Submit this purchase order to start its approval chain."
              />
            ) : isLoadingApprovals ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <ApprovalStepper approvals={approvals ?? []} users={users ?? []} />
            )}
          </Paper>
        </Box>
      </Stack>
    </RecordPageContainer>
  );
}
