import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { RfqListPage } from '../modules/rfq/RfqListPage';
import { PoListPage } from '../modules/po/PoListPage';
import { ApprovalsListPage } from '../modules/approvals/ApprovalsListPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/rfq" replace /> },
      { path: 'rfq', element: <RfqListPage /> },
      { path: 'po', element: <PoListPage /> },
      { path: 'approvals', element: <ApprovalsListPage /> },
    ],
  },
]);
