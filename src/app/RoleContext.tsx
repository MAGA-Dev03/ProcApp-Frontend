import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'requester' | 'approver' | 'finance';

export const ROLE_LABELS: Record<UserRole, string> = {
  requester: 'Requester',
  approver: 'Approver',
  finance: 'Finance',
};

const STORAGE_KEY = 'procapp-role';

interface MockUser {
  name: string;
  email: string;
  initials: string;
}

export const MOCK_USER: MockUser = {
  name: 'A. Ranasinghe',
  email: 'a.ranasinghe@maga.lk',
  initials: 'AR',
};

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: MockUser;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

function getInitialRole(): UserRole {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'requester' || stored === 'approver' || stored === 'finance') return stored;
  return 'requester';
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(getInitialRole);

  const setRole = (next: UserRole) => {
    localStorage.setItem(STORAGE_KEY, next);
    setRoleState(next);
  };

  const value = useMemo<RoleContextValue>(
    () => ({ role, setRole, user: MOCK_USER }),
    [role],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}
