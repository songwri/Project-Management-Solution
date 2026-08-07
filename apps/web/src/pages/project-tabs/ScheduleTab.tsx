import { useMemo, useState } from 'react'
import type { Project } from '../../types'
import { AppCalendar } from '../../components/AppCalendar'
import { GanttChart, type GanttItem } from '../../components/GanttChart'
import { KanbanBoard } from '../../components/KanbanBoard'
import { ViewToggle } from '../../components/ViewToggle'
import { Modal } from '../../components/Modal'
import { ScheduleTaskForm } from '../../components/ScheduleTaskForm'
import { projectScheduleToEvents } from '../../lib/calendarEvents'

type ViewMode = 'calendar' | 'gantt' | 'kanban'

export function ScheduleTab({ project, onSave }: { project: Project; onSave: (p: Project) => void }) {
  const isAgileAware = project.methodology === 'agile' || project.methodology === 'hybrid'
  const [view, setView] = useState<ViewMode>(project.methodology === 'agile' ? 'kanban' : 'calendar')
  const [adding, setAdding] = useState(false)

  const events = useMemo(() => projectScheduleToEvents(project), [project])
  const ganttItems: GanttItem[] = useMemo(
    () =>
      project.schedule.map((task) => ({
        task,
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color,
      })),
    [project],
  )

  const sortedSchedule = useMemo(
    () => [...project.schedule].sort((a, b) => a.start.localeCompare(b.start)),
    [project.schedule],
  )

  const viewOptions = [
    { value: 'calendar' as const, label: '캘린더' },
    { value: 'gantt' as const, label: '간트 차트' },
    ...(isAgileAware ? [{ value: 'kanban' as const, label: '칸반' }] : []),
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewToggle value={view} onChange={setView} options={viewOptions} />
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 일정 추가
        </button>
      </div>

      {view === 'calendar' && <AppCalendar events={events} />}
      {view === 'gantt' && (
        <GanttChart items={ganttItems} emptyMessage="등록된 일정이 없습니다. '일정 추가'로 시작하세요." />
      )}
      {view === 'kanban' && <KanbanBoard tasks={project.schedule} color={project.color} />}

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">일정명</th>
              <th className="text-left font-medium px-4 py-2.5">구분</th>
              <th className="text-left font-medium px-4 py-2.5">기간</th>
              <th className="text-left font-medium px-4 py-2.5">담당자</th>
              <th className="text-left font-medium px-4 py-2.5">진행률</th>
            </tr>
          </thead>
          <tbody>
            {sortedSchedule.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  일정이 없습니다.
                </td>
              </tr>
            )}
            {sortedSchedule.map((task) => (
              <tr key={task.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-medium text-slate-800">
                  {task.category === 'milestone' ? '◆ ' : ''}
                  {task.name}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{task.category === 'milestone' ? '마일스톤' : '작업'}</td>
                <td className="px-4 py-2.5 text-slate-500">
                  {task.start}
                  {task.category !== 'milestone' && ` ~ ${task.end}`}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{task.assignee ?? '-'}</td>
                <td className="px-4 py-2.5 text-slate-500">{task.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {adding && (
        <Modal title="일정 추가" onClose={() => setAdding(false)}>
          <ScheduleTaskForm
            methodology={project.methodology}
            onCancel={() => setAdding(false)}
            onSubmit={(task) => {
              onSave({ ...project, schedule: [...project.schedule, task] })
              setAdding(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
