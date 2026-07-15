import { useMemo, useState } from 'react';
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
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';
import { useUpdatePurchaseOrder } from '../../services/purchaseOrders';
import { useApprovals, useUpdateApproval } from '../../services/approvals';
import { useSuppliers } from '../../services/suppliers';
import { useProjects } from '../../services/projects';
import { sortBySteps } from '../po/approvalChain';
import { useMyPendingApprovals } from '../po/useMyPendingApprovals';
import type { Approval } from '../../types/approval';
import type { PurchaseOrder } from '../../types/purchaseOrder';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
});

interface ActionDialogState {
  po: PurchaseOrder;
  approval: Approval;
  decision: 'approved' | 'rejected';
}

export function ApprovalsListPage() {
  const navigate = useNavigate();
  const { rows: pendingRows, isLoading, isError } = useMyPendingApprovals();
  const { data: approvals } = useApprovals();
  const { data: suppliers } = useSuppliers();
  const { data: projects } = useProjects();
  const updateApproval = useUpdateApproval();
  const updatePurchaseOrder = useUpdatePurchaseOrder();

  const [dialog, setDialog] = useState<ActionDialogState | null>(null);
  const [comment, setComment] = useState('');
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inboxRows = useMemo(() => {
    return pendingRows.map(({ po, approval, totalSteps }) => ({
      po,
      approval,
      totalSteps,
      supplierName: suppliers?.find((s) => s.id === po.supplierId)?.name ?? po.supplierId,
      projectName: projects?.find((p) => p.id === po.projectId)?.name ?? po.projectId,
    }));
  }, [pendingRows, suppliers, projects]);

  const openDialog = (po: PurchaseOrder, approval: Approval, decision: 'approved' | 'rejected') => {
    setDialog({ po, approval, decision });
    setComment('');
    setDialogError(null);
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialog(null);
  };

  const handleConfirm = async () => {
    if (!dialog) return;
    if (dialog.decision === 'rejected' && comment.trim().length === 0) {
      setDialogError('A comment is required when rejecting a purchase order.');
      return;
    }
    setIsSubmitting(true);
    try {
      const decidedDate = new Date().toISOString().slice(0, 10);
      await updateApproval.mutateAsync({
        id: dialog.approval.id,
        changes: { status: dialog.decision, decidedDate, comments: comment.trim() || null },
      });

      if (dialog.decision === 'rejected') {
        await updatePurchaseOrder.mutateAsync({ id: dialog.po.id, changes: { status: 'rejected' } });
      } else {
        const poApprovals = sortBySteps(approvals?.filter((a) => a.poId === dialog.po.id) ?? []);
        const isFinalStep = dialog.approval.stepNumber === poApprovals.length;
        if (isFinalStep) {
          await updatePurchaseOrder.mutateAsync({ id: dialog.po.id, changes: { status: 'approved' } });
        }
      }

      setDialog(null);
    } catch {
      setDialogError('Something went wrong recording this decision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title="Approvals" meta={inboxRows.length > 0 ? `${inboxRows.length} awaiting your decision` : undefined}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {isError && <Alert severity="error">Failed to load approvals.</Alert>}

      {!isLoading && inboxRows.length === 0 && (
        <Paper>
          <EmptyState
            title="Nothing pending your approval"
            description="Purchase orders awaiting your decision will show up here as soon as they reach your step."
          />
        </Paper>
      )}

      {inboxRows.length > 0 && (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>PO ID</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Step</TableCell>
                <TableCell align="right">Total Value</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inboxRows.map(({ po, approval, totalSteps, supplierName, projectName }) => (
                <TableRow key={po.id} hover>
                  <TableCell
                    onClick={() => navigate(`/po/${po.id}`)}
                    sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', cursor: 'pointer' }}
                  >
                    {po.id}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/po/${po.id}`)} sx={{ cursor: 'pointer' }}>
                    {supplierName}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/po/${po.id}`)} sx={{ cursor: 'pointer' }}>
                    {projectName}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13.5 }}>
                      Step {approval.stepNumber} of {totalSteps}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {currencyFormatter.format(po.totalValue)}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" color="error" variant="outlined" onClick={() => openDialog(po, approval, 'rejected')}>
                        Reject
                      </Button>
                      <Button size="small" variant="contained" color="primary" onClick={() => openDialog(po, approval, 'approved')}>
                        Approve
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(dialog)} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'inherit', fontSize: 18 }}>
          {dialog?.decision === 'rejected' ? 'Reject purchase order' : 'Approve purchase order'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mb: 2 }}>
            {dialog?.po.id} — step {dialog?.approval.stepNumber}
          </Typography>
          <TextField
            label={dialog?.decision === 'rejected' ? 'Reason for rejection' : 'Comment (optional)'}
            multiline
            minRows={3}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required={dialog?.decision === 'rejected'}
          />
          {dialogError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {dialogError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={dialog?.decision === 'rejected' ? 'error' : 'primary'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : dialog?.decision === 'rejected' ? 'Reject' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
