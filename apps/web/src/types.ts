// Core data model for the Project Management Solution.
// These types are the single source of truth for the JSON documents
// stored in the GitHub repo under /data (see docs/DATA_MODEL.md).

import { PM_ROLE_KEY, type ProjectAssignment } from './masterData'
export type { ProjectAssignment } from './masterData'

// Status/methodology/health are keys into the renameable master-data
// taxonomy (see masterData.ts + the "마스터 데이터" admin page) — the
// business owner can rename, add, or remove entries without a code change.
// They're plain `string` rather than a fixed union for that reason; a
// handful of RESERVED_* keys below still gate real behavior (the Kanban
// board, the closeout check) and always exist as defaults.
export type ProjectStatus = string
export type Methodology = string
export type HealthStatus = string

export const RESERVED_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ON_HOLD: 'on_hold',
} as const

export const RESERVED_METHODOLOGY = {
  WATERFALL: 'waterfall',
  AGILE: 'agile',
  HYBRID: 'hybrid',
} as const

export const RESERVED_HEALTH = {
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  OFF_TRACK: 'off_track',
} as const

// Default label sets — used to seed masterData.json and as a fallback
// before it loads or for a key the admin hasn't labeled.
export const DEFAULT_STATUSES = [
  { key: RESERVED_STATUS.PLANNING, label: '기획' },
  { key: RESERVED_STATUS.IN_PROGRESS, label: '진행중' },
  { key: RESERVED_STATUS.CLOSING, label: '마감 진행중' },
  { key: RESERVED_STATUS.CLOSED, label: '완료' },
  { key: RESERVED_STATUS.ON_HOLD, label: '보류' },
]

export const DEFAULT_METHODOLOGIES = [
  { key: RESERVED_METHODOLOGY.WATERFALL, label: 'Waterfall' },
  { key: RESERVED_METHODOLOGY.AGILE, label: 'Agile' },
  { key: RESERVED_METHODOLOGY.HYBRID, label: 'Hybrid' },
]

export const DEFAULT_HEALTH_LEVELS = [
  { key: RESERVED_HEALTH.ON_TRACK, label: '정상' },
  { key: RESERVED_HEALTH.AT_RISK, label: '주의' },
  { key: RESERVED_HEALTH.OFF_TRACK, label: '위험' },
]

export function labelFrom(options: { key: string; label: string }[], key: string): string {
  return options.find((o) => o.key === key)?.label ?? key
}

export interface ProjectOverview {
  objective: string
  sponsor: string // business sponsor — free text, may not be a tracked Person
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
  assignee?: string // Person.id — resolve display name via masterData
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
  ownerTeamId?: string // owning team, for team/org-level dashboard views
  assignments: ProjectAssignment[] // who's on this project and in what role
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

export function projectManagerAssignment(project: Project): ProjectAssignment | undefined {
  return project.assignments.find((a) => a.role === PM_ROLE_KEY)
}

export function projectMemberAssignments(project: Project): ProjectAssignment[] {
  return project.assignments.filter((a) => a.role !== PM_ROLE_KEY)
}
