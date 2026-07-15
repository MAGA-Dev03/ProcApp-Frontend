import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Snackbar,
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/StatusPill';
import { EmptyState } from '../../components/EmptyState';
import { RecordPageContainer } from '../../components/RecordPageContainer';
import { useRfq, useUpdateRfq } from '../../services/rfqs';
import { useUsers } from '../../services/userService';
import { useProjects } from '../../services/projects';
import { useSuppliers } from '../../services/suppliers';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
});

export function RfqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: rfq, isLoading, isError } = useRfq(id);
  const { data: users } = useUsers();
  const { data: projects } = useProjects();
  const { data: suppliers } = useSuppliers();
  const updateRfq = useUpdateRfq();
  const [showSentToast, setShowSentToast] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError || !rfq) {
    return (
      <RecordPageContainer maxWidth={960} backTo="/rfq" backLabel="Back to RFQs">
        <Alert severity="error">RFQ not found.</Alert>
      </RecordPageContainer>
    );
  }

  const requester = users?.find((u) => u.id === rfq.requesterId);
  const project = projects?.find((p) => p.id === rfq.projectId);
  const targetSuppliers = rfq.targetSupplierIds
    .map((sid) => suppliers?.find((s) => s.id === sid))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const totalValue = rfq.lineItems.reduce((total, item) => total + item.amount, 0);

  const handleSend = () => {
    updateRfq.mutate(
      { id: rfq.id, changes: { status: 'sent' } },
      {
        onSuccess: () => setShowSentToast(true),
      },
    );
  };

  return (
    <RecordPageContainer maxWidth={960} backTo="/rfq" backLabel="Back to RFQs">
      <PageHeader
        title={rfq.title}
        meta={`${rfq.id} · ${project?.name ?? rfq.projectId}`}
        actions={
          rfq.status === 'draft' ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendOutlinedIcon />}
              onClick={handleSend}
              disabled={updateRfq.isPending}
            >
              {updateRfq.isPending ? 'Sending…' : 'Send RFQ'}
            </Button>
          ) : undefined
        }
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
                Status
              </Typography>
              <Box sx={{ mt: 0.75 }}>
                <StatusPill status={rfq.status} />
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Requested By
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 0.75 }}>{requester?.name ?? rfq.requesterId}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Created
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 0.75, fontVariantNumeric: 'tabular-nums' }}>{rfq.createdDate}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Due
              </Typography>
              <Typography sx={{ fontSize: 14, mt: 0.75, fontVariantNumeric: 'tabular-nums' }}>{rfq.dueDate ?? '—'}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
              Target Suppliers
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {targetSuppliers.length > 0 ? (
                targetSuppliers.map((supplier) => <Chip key={supplier.id} size="small" label={supplier.name} />)
              ) : (
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No suppliers selected</Typography>
              )}
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
                {rfq.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {item.unitPrice > 0 ? currencyFormatter.format(item.unitPrice) : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {item.amount > 0 ? currencyFormatter.format(item.amount) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 600, border: 0 }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', border: 0 }}>
                    {totalValue > 0 ? currencyFormatter.format(totalValue) : '—'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1.5 }}>Supplier Responses</Typography>
          {rfq.supplierResponses.length === 0 ? (
            <Paper>
              <EmptyState
                compact
                title="No responses yet"
                description={
                  rfq.status === 'draft'
                    ? 'Send this RFQ to suppliers to start collecting quotes.'
                    : 'Waiting on suppliers to submit their quotes.'
                }
              />
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="right">Quoted Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rfq.supplierResponses.map((response) => {
                    const supplier = suppliers?.find((s) => s.id === response.supplierId);
                    return (
                      <TableRow key={response.supplierId}>
                        <TableCell>{supplier?.name ?? response.supplierId}</TableCell>
                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{response.submittedDate}</TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {currencyFormatter.format(response.totalQuoted)}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={response.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Stack>

      <Snackbar
        open={showSentToast}
        autoHideDuration={4000}
        onClose={() => setShowSentToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSentToast(false)} sx={{ width: '100%' }}>
          RFQ sent to suppliers.
        </Alert>
      </Snackbar>
    </RecordPageContainer>
  );
}
