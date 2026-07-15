import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { LoginPage } from '../modules/auth/LoginPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { RfqListPage } from '../modules/rfq/RfqListPage';
import { RfqDetailPage } from '../modules/rfq/RfqDetailPage';
import { RfqCreatePage } from '../modules/rfq/RfqCreatePage';
import { PoListPage } from '../modules/po/PoListPage';
import { PoDetailPage } from '../modules/po/PoDetailPage';
import { PoCreatePage } from '../modules/po/PoCreatePage';
import { ApprovalsListPage } from '../modules/approvals/ApprovalsListPage';
import { SuppliersPage } from '../modules/suppliers/SuppliersPage';
import { ProjectsPage } from '../modules/projects/ProjectsPage';
import { ReportsPage } from '../modules/reports/ReportsPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'rfq', element: <RfqListPage /> },
      { path: 'rfq/new', element: <RfqCreatePage /> },
      { path: 'rfq/:id', element: <RfqDetailPage /> },
      { path: 'po', element: <PoListPage /> },
      { path: 'po/new', element: <PoCreatePage /> },
      { path: 'po/:id', element: <PoDetailPage /> },
      { path: 'approvals', element: <ApprovalsListPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);
