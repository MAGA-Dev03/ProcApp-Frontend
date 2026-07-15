import type { SvgIconComponent } from '@mui/icons-material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import type { UserRole } from './RoleContext';

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon, roles: ['requester', 'approver', 'finance'] },
  { label: 'RFQs', path: '/rfq', icon: RequestQuoteOutlinedIcon, roles: ['requester', 'approver', 'finance'] },
  { label: 'Purchase Orders', path: '/po', icon: ReceiptLongOutlinedIcon, roles: ['requester', 'approver', 'finance'] },
  { label: 'Approvals', path: '/approvals', icon: FactCheckOutlinedIcon, roles: ['approver', 'finance'] },
  { label: 'Suppliers', path: '/suppliers', icon: StorefrontOutlinedIcon, roles: ['approver', 'finance'] },
  { label: 'Projects', path: '/projects', icon: FolderOutlinedIcon, roles: ['requester', 'approver'] },
  { label: 'Reports', path: '/reports', icon: AssessmentOutlinedIcon, roles: ['finance', 'approver'] },
];
