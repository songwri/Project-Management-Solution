import { KANBAN_COLUMNS, type ScheduleTask } from '../types'
import { personLabel } from '../masterData'
import { useMasterData } from '../lib/MasterDataContext'

interface Props {
  tasks: ScheduleTask[]
  color: string
}

export function KanbanBoard({ tasks, color }: Props) {
  const { masterData } = useMasterData()
  const workItems = tasks.filter((t) => t.category !== 'meeting')

  if (workItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        칸반에 표시할 작업이 없습니다. '일정 추가'로 작업을 만들면 기본적으로 To Do에 표시됩니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {KANBAN_COLUMNS.map((col) => {
        const items = workItems.filter((t) => (t.kanbanStatus ?? 'todo') === col.status)
        return (
          <div key={col.status} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center justify-between px-1.5 py-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{col.label}</h3>
              <span className="text-xs text-slate-400">{items.length}</span>
            </div>
            <div className="space-y-2 mt-1">
              {items.map((task) => (
                <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-sm font-medium text-slate-800">
                    {task.category === 'milestone' ? '◆ ' : ''}
                    {task.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{task.assignee ? personLabel(masterData.people, task.assignee) : '미배정'}</span>
                    {typeof task.storyPoints === 'number' && (
                      <span
                        className="rounded-full px-1.5 py-0.5 font-semibold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {task.storyPoints}SP
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="px-1.5 py-3 text-center text-xs text-slate-300">비어있음</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
