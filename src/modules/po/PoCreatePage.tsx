import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  MenuItem,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/StatusPill';
import { RecordPageContainer } from '../../components/RecordPageContainer';
import { useRfqs } from '../../services/rfqs';
import { usePurchaseOrders, useCreatePurchaseOrder } from '../../services/purchaseOrders';
import { useCreateApproval } from '../../services/approvals';
import { useSuppliers } from '../../services/suppliers';
import { buildApprovalChain } from './approvalChain';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
});

interface DraftLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: string;
}

export function PoCreatePage() {
  const navigate = useNavigate();
  const { data: rfqs } = useRfqs({ status: 'closed' });
  const { data: purchaseOrders } = usePurchaseOrders();
  const { data: suppliers } = useSuppliers();
  const createPo = useCreatePurchaseOrder();
  const createApproval = useCreateApproval();

  const [rfqId, setRfqId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [lineItems, setLineItems] = useState<DraftLine[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usedRfqIds = useMemo(() => new Set(purchaseOrders?.map((po) => po.rfqId) ?? []), [purchaseOrders]);

  const eligibleRfqs = useMemo(
    () => (rfqs ?? []).filter((rfq) => rfq.supplierResponses.length > 0 && !usedRfqIds.has(rfq.id)),
    [rfqs, usedRfqIds],
  );

  const selectedRfq = eligibleRfqs.find((rfq) => rfq.id === rfqId);

  const handleSelectRfq = (id: string) => {
    setRfqId(id);
    setSubmitError(null);
    const rfq = eligibleRfqs.find((r) => r.id === id);
    if (!rfq) {
      setSupplierId('');
      setLineItems([]);
      return;
    }
    const awarded = rfq.supplierResponses.find((r) => r.status === 'awarded');
    setSupplierId(awarded?.supplierId ?? '');
    setLineItems(
      rfq.lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: '',
      })),
    );
  };

  const updateUnitPrice = (id: string, unitPrice: string) => {
    setLineItems((items) => items.map((item) => (item.id === id ? { ...item, unitPrice } : item)));
  };

  const totalValue = lineItems.reduce((sum, item) => sum + item.quantity * (Number(item.unitPrice) || 0), 0);
  const quotedTotal = selectedRfq?.supplierResponses.find((r) => r.supplierId === supplierId)?.totalQuoted;

  const isValid = Boolean(rfqId && supplierId && lineItems.length > 0 && totalValue > 0);

  const handleSubmit = async () => {
    if (!selectedRfq || !isValid) {
      setSubmitError('Select an RFQ, a winning supplier, and price out the line items before submitting.');
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const po = await createPo.mutateAsync({
        rfqId: selectedRfq.id,
        supplierId,
        projectId: selectedRfq.projectId,
        status: 'pendingApproval',
        lineItems: lineItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: Number(item.unitPrice) || 0,
          amount: item.quantity * (Number(item.unitPrice) || 0),
        })),
        totalValue,
        createdDate: new Date().toISOString().slice(0, 10),
        issuedDate: null,
      });

      const chain = buildApprovalChain(totalValue);
      for (let i = 0; i < chain.length; i += 1) {
        await createApproval.mutateAsync({
          poId: po.id,
          approverId: chain[i],
          stepNumber: i + 1,
          status: 'pending',
          decidedDate: null,
          comments: null,
        });
      }

      navigate(`/po/${po.id}`);
    } catch {
      setSubmitError('Something went wrong creating the purchase order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <RecordPageContainer maxWidth={860} backTo="/po" backLabel="Back to Purchase Orders">
      <PageHeader title="New Purchase Order" meta="Create from RFQ" />

      <Stack spacing={3}>
        <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
            1. Select a closed RFQ
          </Typography>
          <TextField
            select
            label="RFQ"
            value={rfqId}
            onChange={(e) => handleSelectRfq(e.target.value)}
            fullWidth
          >
            {eligibleRfqs.length > 0 ? (
              eligibleRfqs.map((rfq) => (
                <MenuItem key={rfq.id} value={rfq.id}>
                  {rfq.id} — {rfq.title}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No closed RFQs available for a new PO
              </MenuItem>
            )}
          </TextField>
        </Paper>

        {selectedRfq && (
          <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
              2. Pick the winning supplier response
            </Typography>
            <RadioGroup value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <Stack spacing={1.5}>
                {selectedRfq.supplierResponses.map((response) => {
                  const supplier = suppliers?.find((s) => s.id === response.supplierId);
                  return (
                    <Paper
                      key={response.supplierId}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderColor: supplierId === response.supplierId ? 'primary.main' : 'divider',
                      }}
                    >
                      <FormControlLabel
                        value={response.supplierId}
                        control={<Radio size="small" />}
                        label={
                          <Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{supplier?.name ?? response.supplierId}</Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                              Quoted {currencyFormatter.format(response.totalQuoted)} · {response.submittedDate}
                            </Typography>
                          </Box>
                        }
                      />
                      <StatusPill status={response.status} />
                    </Paper>
                  );
                })}
              </Stack>
            </RadioGroup>
          </Paper>
        )}

        {selectedRfq && supplierId && (
          <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
              3. Review and price the line items
            </Typography>
            {quotedTotal !== undefined && (
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mb: 1.5 }}>
                Supplier quoted a total of {currencyFormatter.format(quotedTotal)} — allocate it across line items below.
              </Typography>
            )}
            <TableContainer>
              <Table size="small">
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
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateUnitPrice(item.id, e.target.value)}
                          slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                          sx={{ width: 130 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {currencyFormatter.format(item.quantity * (Number(item.unitPrice) || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} sx={{ fontWeight: 600, border: 0 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', border: 0 }}>
                      {currencyFormatter.format(totalValue)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={() => navigate('/po')}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit for Approval'}
          </Button>
        </Box>
      </Stack>
    </RecordPageContainer>
  );
}
