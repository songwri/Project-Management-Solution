// Org/people master data + the "master data" taxonomy (renameable labels for
// status/methodology/health/project-role). Stored separately from project
// data at /data/masterData.json so it can be managed on its own admin page
// without touching individual project files.

export interface Team {
  id: string
  name: string
  parentTeamId?: string // undefined = top-level org unit
}

export interface Person {
  id: string
  name: string
  teamId: string
  title: string // 직급 (e.g. "매니저", "책임", "사원")
}

// A single renameable {key, label} pair. `key` is the stable value stored on
// projects/tasks and referenced by business logic (e.g. methodology 'agile'
// unlocks the Kanban board); `label` is the only thing the master-data admin
// page lets you edit for built-in keys. New custom keys can also be added —
// they display and filter normally, they just don't unlock methodology- or
// status-specific behavior tied to the reserved keys.
export interface MasterOption {
  key: string
  label: string
}

// Manually logged extra hours for a person in a given month, on top of
// whatever their scheduled tasks already imply. This is how "야근"
// (overtime) pushes someone's utilisation past 1.0 person-month even when
// their assigned task date-ranges alone wouldn't.
export interface OvertimeLog {
  id: string
  personId: string
  month: string // "YYYY-MM"
  hours: number
  note?: string
}

export interface MasterData {
  teams: Team[]
  people: Person[]
  statuses: MasterOption[]
  methodologies: MasterOption[]
  healthLevels: MasterOption[]
  projectRoles: MasterOption[]
  overtimeLogs: OvertimeLog[]
}

// Reserved role keys used for display logic (e.g. "who is the PM" in a
// project summary). Additional custom roles can be added freely.
export const PM_ROLE_KEY = 'pm'
export const MEMBER_ROLE_KEY = 'member'

export interface ProjectAssignment {
  personId: string
  role: string // key into MasterData.projectRoles
}

export function findTeam(teams: Team[], id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

export function findPerson(people: Person[], id: string): Person | undefined {
  return people.find((p) => p.id === id)
}

export function personLabel(people: Person[], id: string): string {
  return findPerson(people, id)?.name ?? '알 수 없음'
}

export function optionLabel(options: MasterOption[], key: string): string {
  return options.find((o) => o.key === key)?.label ?? key
}

// All descendant team IDs of `teamId`, including itself — used for
// "상위조직 단위로 보기" roll-up filtering.
export function teamAndDescendantIds(teams: Team[], teamId: string): Set<string> {
  const ids = new Set<string>([teamId])
  let added = true
  while (added) {
    added = false
    for (const t of teams) {
      if (t.parentTeamId && ids.has(t.parentTeamId) && !ids.has(t.id)) {
        ids.add(t.id)
        added = true
      }
    }
  }
  return ids
}
