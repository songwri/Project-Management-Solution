import { useState, type FormEvent } from 'react'
import type { Risk, RiskSeverity } from '../types'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function RiskForm({ onSubmit, onCancel }: { onSubmit: (risk: Risk) => void; onCancel: () => void }) {
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<RiskSeverity>('medium')
  const [owner, setOwner] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!description) return
    onSubmit({
      id: `risk-${Date.now().toString(36)}`,
      description,
      severity,
      owner: owner || undefined,
      resolved: false,
      createdAt: new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>리스크 내용</label>
        <textarea
          className={inputCls}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>심각도</label>
          <select className={inputCls} value={severity} onChange={(e) => setSeverity(e.target.value as RiskSeverity)}>
            <option value="low">낮음</option>
            <option value="medium">중간</option>
            <option value="high">높음</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>담당자</label>
          <input className={inputCls} value={owner} onChange={(e) => setOwner(e.target.value)} />
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
          등록
        </button>
      </div>
    </form>
  )
}
