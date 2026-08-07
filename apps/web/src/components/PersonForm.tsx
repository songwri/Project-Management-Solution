import { useState, type FormEvent } from 'react'
import type { Person, Team } from '../masterData'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function PersonForm({
  teams,
  onSubmit,
  onCancel,
}: {
  teams: Team[]
  onSubmit: (person: Person) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '')
  const [title, setTitle] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name || !teamId) return
    onSubmit({
      id: `p-${Date.now().toString(36)}`,
      name,
      teamId,
      title,
    })
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">먼저 팀을 하나 이상 등록해야 담당자를 추가할 수 있습니다.</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            닫기
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>이름</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>소속 팀</label>
          <select className={inputCls} value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>직급</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="사원, 선임, 책임..."
          />
        </div>
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
