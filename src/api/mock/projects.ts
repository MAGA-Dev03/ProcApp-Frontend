import type { Page, PageParams, Project } from '@/types'
import { ApiError } from '../apiError'
import { db } from './db'
import { delay, paginate } from './utils'

export interface ListProjectsParams extends PageParams {
  status?: Project['status']
  search?: string
}

export async function listProjects(params: ListProjectsParams = {}): Promise<Page<Project>> {
  await delay()

  let results = db.projects
  if (params.status) {
    results = results.filter((project) => project.status === params.status)
  }
  if (params.search) {
    const search = params.search.toLowerCase()
    results = results.filter(
      (project) =>
        project.name.toLowerCase().includes(search) || project.code.toLowerCase().includes(search),
    )
  }

  return paginate(results, params)
}

export async function getProject(id: number): Promise<Project> {
  await delay()

  const project = db.projects.find((p) => p.id === id)
  if (!project) {
    throw new ApiError(`Project ${id} not found`, 404)
  }
  return project
}
