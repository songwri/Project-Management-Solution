import { useState, type FormEvent } from 'react'
import type { Person, MasterOption } from '../masterData'
import type { ProjectAssignment } from '../types'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function AssignmentForm({
  people,
  roles,
  excludePersonIds,
  onSubmit,
  onCancel,
}: {
  people: Person[]
  roles: MasterOption[]
  excludePersonIds: string[]
  onSubmit: (assignment: ProjectAssignment) => void
  onCancel: () => void
}) {
  const available = people.filter((p) => !excludePersonIds.includes(p.id))
  const [personId, setPersonId] = useState(available[0]?.id ?? '')
  const [role, setRole] = useState(roles[0]?.key ?? 'member')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!personId) return
    onSubmit({ personId, role })
  }

  if (available.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          추가할 수 있는 담당자가 없습니다. 이미 모두 배정되었거나, 설정 &gt; 담당자 관리에서 먼저 인원을
          등록하세요.
        </p>
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
        <label className={labelCls}>담당자</label>
        <select className={inputCls} value={personId} onChange={(e) => setPersonId(e.target.value)}>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.title})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>역할</label>
        <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
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
