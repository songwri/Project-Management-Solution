import { useState, type FormEvent } from 'react'
import type { Team } from '../masterData'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function TeamForm({
  teams,
  onSubmit,
  onCancel,
}: {
  teams: Team[]
  onSubmit: (team: Team) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [parentTeamId, setParentTeamId] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name) return
    onSubmit({
      id: `team-${Date.now().toString(36)}`,
      name,
      parentTeamId: parentTeamId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>팀/조직명</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>상위 조직 (선택)</label>
        <select className={inputCls} value={parentTeamId} onChange={(e) => setParentTeamId(e.target.value)}>
          <option value="">없음 (최상위 조직)</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
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
