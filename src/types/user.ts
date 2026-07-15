import type { UserRole } from '../app/RoleContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}
