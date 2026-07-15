export type ProjectStatus = 'active' | 'onHold' | 'completed';

export interface Project {
  id: string;
  name: string;
  code: string;
  department: string;
  status: ProjectStatus;
}
