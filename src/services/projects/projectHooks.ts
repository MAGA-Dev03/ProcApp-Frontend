import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Project, ProjectStatus } from '../../types/project';
import { projectRepository } from './projectRepository';

export interface ProjectFilters {
  status?: ProjectStatus;
  department?: string;
}

export type CreateProjectInput = Omit<Project, 'id'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

const projectKeys = {
  all: ['projects'] as const,
  list: (filters?: ProjectFilters) => ['projects', 'list', filters ?? {}] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
};

function matchesFilters(project: Project, filters?: ProjectFilters): boolean {
  if (!filters) return true;
  if (filters.status && project.status !== filters.status) return false;
  if (filters.department && project.department !== filters.department) return false;
  return true;
}

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectRepository.list((project) => matchesFilters(project, filters)),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => projectRepository.getById(id as string).then((result) => result ?? null),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateProjectInput }) => projectRepository.update(id, changes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.setQueryData(projectKeys.detail(updated.id), updated);
    },
  });
}
