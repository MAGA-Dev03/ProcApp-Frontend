import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PageContainer } from '../../components/PageContainer';
import { useRfqs } from '../../services/rfqService';

export function RfqListPage() {
  const { data: rfqs, isLoading, isError } = useRfqs();

  return (
    <PageContainer title="Requests for Quote">
      {isLoading && <CircularProgress />}
      {isError && <Alert severity="error">Failed to load RFQs.</Alert>}
      {rfqs && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rfqs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell>{rfq.id}</TableCell>
                  <TableCell>{rfq.title}</TableCell>
                  <TableCell>
                    <Chip label={rfq.status} size="small" />
                  </TableCell>
                  <TableCell>{rfq.requestedBy}</TableCell>
                  <TableCell>{rfq.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
}
