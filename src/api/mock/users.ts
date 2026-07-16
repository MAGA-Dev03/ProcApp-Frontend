import type { Page, PageParams, RoleName, User } from '@/types'
import { ApiError } from '../apiError'
import { db } from './db'
import { delay, paginate } from './utils'

export interface ListUsersParams extends PageParams {
  role?: RoleName
  active?: boolean
  search?: string
}

export async function listUsers(params: ListUsersParams = {}): Promise<Page<User>> {
  await delay()

  let results = db.users
  if (params.role) {
    results = results.filter((user) => user.roles.some((role) => role.name === params.role))
  }
  if (params.active !== undefined) {
    results = results.filter((user) => user.active === params.active)
  }
  if (params.search) {
    const search = params.search.toLowerCase()
    results = results.filter(
      (user) =>
        user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
    )
  }

  return paginate(results, params)
}

export async function getUser(id: number): Promise<User> {
  await delay()

  const user = db.users.find((u) => u.id === id)
  if (!user) {
    throw new ApiError(`User ${id} not found`, 404)
  }
  return user
}
