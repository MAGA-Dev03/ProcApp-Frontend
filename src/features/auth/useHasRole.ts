import type { RoleName } from '@/types'
import { useAuth } from './AuthContext'

/** True if the current user holds any of the given roles. No roles passed = any authenticated user. */
export function useHasRole(...roles: RoleName[]): boolean {
  const { currentUser } = useAuth()
  if (!currentUser) return false
  if (roles.length === 0) return true
  return currentUser.roles.some((role) => roles.includes(role.name))
}
