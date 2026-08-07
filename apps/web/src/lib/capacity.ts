import {
  eachDayOfInterval,
  endOfMonth,
  isWeekend,
  max as maxDate,
  min as minDate,
  parseISO,
  startOfMonth,
} from 'date-fns'
import type { Project } from '../types'
import type { OvertimeLog, Person } from '../masterData'

export const STANDARD_HOURS_PER_DAY = 8

function businessDaysBetween(start: Date, end: Date): number {
  if (start > end) return 0
  return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d)).length
}

/** Business (Mon-Fri) day count in the given "YYYY-MM" month. */
export function businessDaysInMonth(monthISO: string): number {
  const anchor = parseISO(`${monthISO}-01`)
  return businessDaysBetween(startOfMonth(anchor), endOfMonth(anchor))
}

/**
 * Business days a person is scheduled across all their tasks (any project,
 * any status) that overlap the given month — a task spanning multiple
 * months only counts the days that fall inside this one.
 */
export function assignedDaysInMonth(personId: string, projects: Project[], monthISO: string): number {
  const anchor = parseISO(`${monthISO}-01`)
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(anchor)

  let days = 0
  for (const project of projects) {
    for (const task of project.schedule) {
      if (task.assignee !== personId || task.category === 'meeting') continue
      const taskStart = parseISO(task.start)
      const taskEnd = parseISO(task.end)
      const overlapStart = maxDate([taskStart, monthStart])
      const overlapEnd = minDate([taskEnd, monthEnd])
      days += businessDaysBetween(overlapStart, overlapEnd)
    }
  }
  return days
}

export interface PersonCapacity {
  personId: string
  monthISO: string
  standardDays: number
  assignedDays: number
  overtimeHours: number
  standardHours: number
  scheduledHours: number
  totalHours: number
  utilization: number // totalHours / standardHours; > 1 means over one person-month
  projectCount: number
}

export function computePersonCapacity(
  person: Person,
  projects: Project[],
  overtimeLogs: OvertimeLog[],
  monthISO: string,
): PersonCapacity {
  const standardDays = businessDaysInMonth(monthISO)
  const assignedDays = assignedDaysInMonth(person.id, projects, monthISO)
  const overtimeHours = overtimeLogs
    .filter((o) => o.personId === person.id && o.month === monthISO)
    .reduce((sum, o) => sum + o.hours, 0)

  const standardHours = standardDays * STANDARD_HOURS_PER_DAY
  const scheduledHours = assignedDays * STANDARD_HOURS_PER_DAY
  const totalHours = scheduledHours + overtimeHours
  const projectCount = new Set(
    projects.filter((p) => p.schedule.some((t) => t.assignee === person.id)).map((p) => p.id),
  ).size

  return {
    personId: person.id,
    monthISO,
    standardDays,
    assignedDays,
    overtimeHours,
    standardHours,
    scheduledHours,
    totalHours,
    utilization: standardHours > 0 ? totalHours / standardHours : 0,
    projectCount,
  }
}

export type OverloadLevel = 'normal' | 'busy' | 'overloaded'

export function overloadLevel(utilization: number): OverloadLevel {
  if (utilization > 1) return 'overloaded'
  if (utilization >= 0.85) return 'busy'
  return 'normal'
}

export function currentMonthISO(): string {
  return new Date().toISOString().slice(0, 7)
}
