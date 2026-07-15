import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  MenuItem,
  Autocomplete,
  Alert,
} from '@mui/material';
import { PageHeader } from '../../components/PageHeader';
import { RecordPageContainer } from '../../components/RecordPageContainer';
import { LineItemsEditor } from './components/LineItemsEditor';
import type { DraftLineItem } from './components/LineItemsEditor';
import { useCreateRfq } from '../../services/rfqs';
import { useProjects } from '../../services/projects';
import { useSuppliers } from '../../services/suppliers';
import { useUsers } from '../../services/userService';
import { useRole } from '../../app/RoleContext';
import type { Supplier } from '../../types/supplier';

function createEmptyLineItem(): DraftLineItem {
  return { key: crypto.randomUUID(), description: '', quantity: '', unit: '' };
}

export function RfqCreatePage() {
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const { data: suppliers } = useSuppliers();
  const { data: users } = useUsers();
  const { user: currentUser } = useRole();
  const createRfq = useCreateRfq();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [targetSuppliers, setTargetSuppliers] = useState<Supplier[]>([]);
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([createEmptyLineItem()]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeSuppliers = suppliers?.filter((s) => s.status === 'active') ?? [];

  const validLineItems = lineItems.filter(
    (item) => item.description.trim() && item.unit.trim() && Number(item.quantity) > 0,
  );

  const isValid =
    title.trim().length > 0 &&
    projectId.length > 0 &&
    dueDate.length > 0 &&
    targetSuppliers.length > 0 &&
    validLineItems.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setSubmitError('Fill in the title, project, due date, at least one supplier, and at least one complete line item.');
      return;
    }
    setSubmitError(null);

    const requesterId = users?.find((u) => u.email === currentUser.email)?.id ?? 'U-001';

    createRfq.mutate(
      {
        title: title.trim(),
        projectId,
        requesterId,
        status: 'draft',
        createdDate: new Date().toISOString().slice(0, 10),
        dueDate,
        targetSupplierIds: targetSuppliers.map((s) => s.id),
        lineItems: validLineItems.map((item) => ({
          id: `LI-${crypto.randomUUID()}`,
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unit: item.unit.trim(),
          unitPrice: 0,
          amount: 0,
        })),
        supplierResponses: [],
      },
      {
        onSuccess: (created) => navigate(`/rfq/${created.id}`),
      },
    );
  };

  return (
    <RecordPageContainer maxWidth={860} backTo="/rfq" backLabel="Back to RFQs">
      <PageHeader title="New RFQ" meta="Requests for Quote" />

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Stack spacing={3}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              sx={{ flex: 1, minWidth: 220 }}
            >
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  Loading projects…
                </MenuItem>
              )}
            </TextField>

            <TextField
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1, minWidth: 180 }}
            />
          </Box>

          <Autocomplete
            multiple
            options={activeSuppliers}
            getOptionLabel={(option) => option.name}
            value={targetSuppliers}
            onChange={(_, value) => setTargetSuppliers(value)}
            loading={!suppliers}
            loadingText="Loading suppliers…"
            renderInput={(params) => (
              <TextField {...params} label="Target suppliers" placeholder="Select suppliers to send to" required={targetSuppliers.length === 0} />
            )}
          />

          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2 }}>Line Items</Typography>
            <LineItemsEditor items={lineItems} onChange={setLineItems} />
          </Box>

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={() => navigate('/rfq')}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={createRfq.isPending}>
              {createRfq.isPending ? 'Saving…' : 'Save as Draft'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </RecordPageContainer>
  );
}
