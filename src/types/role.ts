export const ROLE_NAMES = [
  'ADMIN',
  'PROCUREMENT',
  'REPORT_USER',
  'SITE_STORE_KEEPER',
  'SENIOR_MANAGER',
  'PROCUREMENT_MANAGER',
] as const

export type RoleName = (typeof ROLE_NAMES)[number]

export interface Role {
  id: number
  name: RoleName
}
