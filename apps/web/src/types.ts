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

// Methodology governs how the Schedule tab renders: waterfall shows
// calendar/Gantt only, agile adds a Kanban board, hybrid offers both.
export type Methodology = 'waterfall' | 'agile' | 'hybrid'

export const METHODOLOGY_LABEL: Record<Methodology, string> = {
  waterfall: 'Waterfall',
  agile: 'Agile',
  hybrid: 'Hybrid',
}

// Health is a PM's risk call ("are we going to hit the date"), distinct
// from `status` (lifecycle stage). Drives the 🟢/🟡/🔴 dot everywhere.
export type HealthStatus = 'on_track' | 'at_risk' | 'off_track'

export const HEALTH_LABEL: Record<HealthStatus, string> = {
  on_track: '정상',
  at_risk: '주의',
  off_track: '위험',
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

export type KanbanStatus = 'todo' | 'doing' | 'review' | 'done'

export const KANBAN_COLUMNS: { status: KanbanStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'doing', label: 'Doing' },
  { status: 'review', label: 'Review' },
  { status: 'done', label: 'Done' },
]

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
  // Agile/Hybrid only: rendered as a Kanban board instead of/alongside Gantt.
  kanbanStatus?: KanbanStatus
  storyPoints?: number
  sprintId?: string
}

export interface Sprint {
  id: string
  name: string
  start: string // ISO date
  end: string // ISO date
  storyPointsPlanned?: number
}

export type RiskSeverity = 'low' | 'medium' | 'high'

export interface Risk {
  id: string
  description: string
  severity: RiskSeverity
  owner?: string
  resolved: boolean
  createdAt: string // ISO date
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

export interface BudgetTracking {
  planned: number // KRW
  spent: number // KRW
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  methodology: Methodology
  health: HealthStatus
  color: string // hex, used consistently across calendar/gantt for this project
  overview: ProjectOverview
  scope: ProjectScope
  schedule: ScheduleTask[]
  sprints: Sprint[]
  risks: Risk[]
  meetingMinutes: MeetingMinute[]
  deliverables: Deliverable[]
  progressLog: ProgressLogEntry[]
  budgetTracking?: BudgetTracking
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

export function overallProgress(project: Project): number {
  if (project.schedule.length === 0) return 0
  const total = project.schedule.reduce((sum, t) => sum + t.progress, 0)
  return Math.round(total / project.schedule.length)
}

export function openRiskCount(project: Project): number {
  return project.risks.filter((r) => !r.resolved).length
}

export function budgetConsumptionPct(project: Project): number | null {
  const b = project.budgetTracking
  if (!b || b.planned <= 0) return null
  return Math.round((b.spent / b.planned) * 100)
}
