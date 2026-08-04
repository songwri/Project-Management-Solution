import type { EventInput } from '@fullcalendar/core'
import type { Project } from '../types'

// FullCalendar treats `end` as exclusive, but our schedule tasks store an
// inclusive end date, so all-day ranges need +1 day to render correctly.
function toExclusiveEnd(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function projectScheduleToEvents(project: Project, includeProjectPrefix = false): EventInput[] {
  const scheduleEvents: EventInput[] = project.schedule.map((task) => ({
    id: `${project.id}::task::${task.id}`,
    title: includeProjectPrefix ? `[${project.name}] ${task.name}` : task.name,
    start: task.start,
    end: toExclusiveEnd(task.end),
    allDay: true,
    backgroundColor: project.color,
    borderColor: project.color,
    classNames: task.category === 'milestone' ? ['font-semibold'] : [],
    extendedProps: { kind: 'task', projectId: project.id, taskId: task.id },
  }))

  const meetingEvents: EventInput[] = project.meetingMinutes.map((m) => ({
    id: `${project.id}::meeting::${m.id}`,
    title: includeProjectPrefix ? `🗓 [${project.name}] ${m.title}` : `🗓 ${m.title}`,
    start: m.date,
    allDay: true,
    backgroundColor: 'white',
    borderColor: project.color,
    textColor: project.color,
    classNames: ['border', 'font-medium'],
    extendedProps: { kind: 'meeting', projectId: project.id, meetingId: m.id },
  }))

  return [...scheduleEvents, ...meetingEvents]
}

export function portfolioToEvents(projects: Project[]): EventInput[] {
  return projects.flatMap((p) => projectScheduleToEvents(p, true))
}
