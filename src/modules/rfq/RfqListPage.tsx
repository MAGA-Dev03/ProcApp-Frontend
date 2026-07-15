import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageContainer } from '../../components/PageContainer';
import { StatusPill } from '../../components/StatusPill';
import { EmptyState } from '../../components/EmptyState';
import { ClickableTableRow } from '../../components/ClickableTableRow';
import { useRfqs } from '../../services/rfqs';
import { useUsers } from '../../services/userService';
import { useProjects } from '../../services/projects';
import type { Rfq, RfqStatus } from '../../types/rfq';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
});

const STATUS_OPTIONS: { value: RfqStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'responsesReceived', label: 'Responses Received' },
  { value: 'closed', label: 'Closed' },
];

type SortColumn = 'id' | 'title' | 'project' | 'requester' | 'status' | 'value' | 'due';
type SortDirection = 'asc' | 'desc';

function sumLineItems(lineItems: { amount: number }[]) {
  return lineItems.reduce((total, item) => total + item.amount, 0);
}

export function RfqListPage() {
  const navigate = useNavigate();
  const { data: rfqs, isLoading, isError } = useRfqs();
  const { data: users } = useUsers();
  const { data: projects } = useProjects();

  const [statusFilter, setStatusFilter] = useState<RfqStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn>('due');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const rows = useMemo(() => {
    if (!rfqs) return [];
    return rfqs.map((rfq: Rfq) => ({
      rfq,
      projectName: projects?.find((p) => p.id === rfq.projectId)?.name ?? rfq.projectId,
      requesterName: users?.find((u) => u.id === rfq.requesterId)?.name ?? rfq.requesterId,
      totalValue: sumLineItems(rfq.lineItems),
    }));
  }, [rfqs, projects, users]);

  const filteredRows = useMemo(() => {
    return rows.filter(({ rfq }) => {
      if (statusFilter !== 'all' && rfq.status !== statusFilter) return false;
      if (projectFilter !== 'all' && rfq.projectId !== projectFilter) return false;
      return true;
    });
  }, [rows, statusFilter, projectFilter]);

  const sortedRows = useMemo(() => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      switch (sortColumn) {
        case 'id':
          return a.rfq.id.localeCompare(b.rfq.id) * dir;
        case 'title':
          return a.rfq.title.localeCompare(b.rfq.title) * dir;
        case 'project':
          return a.projectName.localeCompare(b.projectName) * dir;
        case 'requester':
          return a.requesterName.localeCompare(b.requesterName) * dir;
        case 'status':
          return a.rfq.status.localeCompare(b.rfq.status) * dir;
        case 'value':
          return (a.totalValue - b.totalValue) * dir;
        case 'due':
          return (a.rfq.dueDate ?? '').localeCompare(b.rfq.dueDate ?? '') * dir;
        default:
          return 0;
      }
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const newRfqButton = (
    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/rfq/new')}>
      New RFQ
    </Button>
  );

  const columns: { key: SortColumn; label: string; align?: 'right' }[] = [
    { key: 'id', label: 'RFQ ID' },
    { key: 'title', label: 'Title' },
    { key: 'project', label: 'Project' },
    { key: 'requester', label: 'Requested By' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Est. Value', align: 'right' },
    { key: 'due', label: 'Due' },
  ];

  return (
    <PageContainer title="Requests for Quote" meta={rfqs ? `${rfqs.length} RFQs` : undefined} actions={newRfqButton}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {isError && <Alert severity="error">Failed to load RFQs.</Alert>}

      {rfqs && rfqs.length === 0 && (
        <Paper>
          <EmptyState
            title="No RFQs yet — create one to get started"
            description="Requests for quote you create will show up here, ready to send to suppliers."
            action={newRfqButton}
          />
        </Paper>
      )}

      {rfqs && rfqs.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="rfq-status-filter-label">Status</InputLabel>
              <Select
                labelId="rfq-status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RfqStatus | 'all')}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="rfq-project-filter-label">Project</InputLabel>
              <Select
                labelId="rfq-project-filter-label"
                label="Project"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <MenuItem value="all">All projects</MenuItem>
                {projects?.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {sortedRows.length === 0 ? (
            <Paper>
              <EmptyState
                title="No RFQs match these filters"
                description="Try a different status or project, or clear the filters."
                compact
                action={
                  <Button
                    size="small"
                    onClick={() => {
                      setStatusFilter('all');
                      setProjectFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align}>
                        <TableSortLabel
                          active={sortColumn === col.key}
                          direction={sortColumn === col.key ? sortDirection : 'asc'}
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRows.map(({ rfq, projectName, requesterName, totalValue }) => (
                    <ClickableTableRow key={rfq.id} onActivate={() => navigate(`/rfq/${rfq.id}`)}>
                      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {rfq.id}
                      </TableCell>
                      <TableCell>{rfq.title}</TableCell>
                      <TableCell>{projectName}</TableCell>
                      <TableCell>{requesterName}</TableCell>
                      <TableCell>
                        <StatusPill status={rfq.status} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {totalValue > 0 ? currencyFormatter.format(totalValue) : '—'}
                      </TableCell>
                      <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{rfq.dueDate ?? '—'}</TableCell>
                    </ClickableTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </PageContainer>
  );
}
