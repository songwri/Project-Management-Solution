import { useEffect, useRef } from 'react'
import Gantt from 'frappe-gantt'
import 'frappe-gantt/dist/frappe-gantt.css'
import type { ScheduleTask } from '../types'

export interface GanttItem {
  task: ScheduleTask
  projectId: string
  projectName: string
  projectColor: string
}

interface Props {
  items: GanttItem[]
  viewMode?: 'Day' | 'Week' | 'Month'
  onTaskClick?: (item: GanttItem) => void
  emptyMessage?: string
}

// Thin wrapper around frappe-gantt (MIT). Used both for a single project's
// schedule and for the portfolio-wide rollup (all projects' tasks, colored
// by project so cross-project overlaps are visible at a glance).
export function GanttChart({ items, viewMode = 'Week', onTaskClick, emptyMessage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<Gantt | null>(null)

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return

    const tasks = items.map((item) => ({
      id: `${item.projectId}::${item.task.id}`,
      name: item.task.category === 'milestone' ? `◆ ${item.task.name}` : item.task.name,
      start: item.task.start,
      end: item.task.end,
      progress: item.task.progress,
      dependencies: (item.task.dependsOn ?? []).map((d) => `${item.projectId}::${d}`).join(','),
      custom_class: item.task.category === 'milestone' ? 'gantt-milestone' : undefined,
    }))

    containerRef.current.innerHTML = ''
    ganttRef.current = new Gantt(containerRef.current, tasks, {
      view_mode: viewMode,
      bar_height: 22,
      bar_corner_radius: 4,
      padding: 16,
      readonly: true,
      popup_on: 'hover',
      popup: ({ task }) => {
        const item = items.find((i) => `${i.projectId}::${i.task.id}` === task.id)
        if (!item) return task.name
        return `<div style="padding:4px 2px;font-size:12px;line-height:1.5">
          <strong>${item.task.name}</strong><br/>
          ${item.projectName}<br/>
          ${item.task.start} → ${item.task.end}<br/>
          진행률 ${item.task.progress}%
        </div>`
      },
      on_click: (task) => {
        const item = items.find((i) => `${i.projectId}::${i.task.id}` === task.id)
        if (item && onTaskClick) onTaskClick(item)
      },
    })
  }, [items, viewMode, onTaskClick])

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        {emptyMessage ?? '표시할 일정이 없습니다.'}
      </div>
    )
  }

  return (
    <div className="gantt-container rounded-lg border border-slate-200 bg-white p-2">
      <div ref={containerRef} />
    </div>
  )
}
