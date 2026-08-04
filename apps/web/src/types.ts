// Core data model for the Project Management Solution.
// These types are the single source of truth for the JSON documents
// stored in the GitHub repo under /data (see docs/DATA_MODEL.md).

export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'closing' // deliverables submitted, pending final sign-off
  | 'closed'
  | 'on_hold'

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: '기획',
  in_progress: '진행중',
  closing: '마감 진행중',
  closed: '완료',
  on_hold: '보류',
}

export interface ProjectOverview {
  objective: string
  sponsor: string
  manager: string
  members: string[]
  startDate: string // ISO date
  endDate: string // ISO date (target)
  budget?: string
  background?: string
}

export interface ProjectScope {
  inScope: string[]
  outOfScope: string[]
  plannedDeliverables: string[]
  constraints?: string
}

export type TaskCategory = 'milestone' | 'task' | 'meeting'

export interface ScheduleTask {
  id: string
  name: string
  start: string // ISO date
  end: string // ISO date
  progress: number // 0-100
  category: TaskCategory
  assignee?: string
  dependsOn?: string[]
  notes?: string
}

export interface ActionItem {
  id: string
  description: string
  owner: string
  dueDate?: string
  done: boolean
}

export interface MeetingMinute {
  id: string
  date: string // ISO date
  title: string
  attendees: string[]
  agenda: string
  decisions: string
  actionItems: ActionItem[]
}

export type DeliverableStatus = 'draft' | 'submitted' | 'approved'

export interface Deliverable {
  id: string
  name: string
  type: string // e.g. "보고서", "설계문서", "소스코드"
  status: DeliverableStatus
  link: string // URL: GitHub file, SharePoint/Teams link, etc.
  submittedBy: string
  submittedAt: string // ISO date
  notes?: string
}

export interface ProgressLogEntry {
  id: string
  date: string // ISO date
  percentComplete: number
  summary: string
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  color: string // hex, used consistently across calendar/gantt for this project
  overview: ProjectOverview
  scope: ProjectScope
  schedule: ScheduleTask[]
  meetingMinutes: MeetingMinute[]
  deliverables: Deliverable[]
  progressLog: ProgressLogEntry[]
  updatedAt: string // ISO datetime, set by the write API on every save
}

export interface Portfolio {
  name: string
  description: string
  projectIds: string[]
}

// Helper: a project may only move to "closed" once at least one
// deliverable has been submitted/approved. Enforced both in the UI
// and (recommended) in the Worker API before it commits the change.
export function canCloseProject(project: Project): boolean {
  return project.deliverables.some(
    (d) => d.status === 'submitted' || d.status === 'approved',
  )
}
