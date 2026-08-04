import { useState, type FormEvent } from 'react'
import type { ScheduleTask, TaskCategory } from '../types'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function ScheduleTaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (task: ScheduleTask) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TaskCategory>('task')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [assignee, setAssignee] = useState('')
  const [progress, setProgress] = useState(0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name || !start || !end) return
    onSubmit({
      id: `t-${Date.now().toString(36)}`,
      name,
      category,
      start,
      end: category === 'milestone' ? start : end,
      progress,
      assignee: assignee || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>일정명</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>구분</label>
          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
          >
            <option value="task">작업</option>
            <option value="milestone">마일스톤</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>담당자</label>
          <input className={inputCls} value={assignee} onChange={(e) => setAssignee(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>시작일</label>
          <input
            type="date"
            className={inputCls}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        {category !== 'milestone' && (
          <div>
            <label className={labelCls}>종료일</label>
            <input
              type="date"
              className={inputCls}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>진행률 ({progress}%)</label>
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          취소
        </button>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          추가
        </button>
      </div>
    </form>
  )
}
