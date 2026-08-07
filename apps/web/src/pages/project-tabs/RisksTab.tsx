import { useState } from 'react'
import type { Project, RiskSeverity } from '../../types'
import { Modal } from '../../components/Modal'
import { RiskForm } from '../../components/RiskForm'

const SEVERITY_STYLE: Record<RiskSeverity, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-rose-100 text-rose-700',
}
const SEVERITY_LABEL: Record<RiskSeverity, string> = { low: '낮음', medium: '중간', high: '높음' }

export function RisksTab({ project, onSave }: { project: Project; onSave: (p: Project) => void }) {
  const [adding, setAdding] = useState(false)
  const sorted = [...project.risks].sort((a, b) => Number(a.resolved) - Number(b.resolved))

  function toggleResolved(id: string) {
    onSave({
      ...project,
      risks: project.risks.map((r) => (r.id === id ? { ...r, resolved: !r.resolved } : r)),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 리스크 등록
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          등록된 리스크가 없습니다.
        </p>
      )}

      <div className="space-y-2">
        {sorted.map((r) => (
          <div
            key={r.id}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 ${
              r.resolved ? 'opacity-60' : ''
            }`}
          >
            <div className="min-w-0">
              <p className={`font-medium text-slate-900 ${r.resolved ? 'line-through' : ''}`}>{r.description}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {r.owner || '담당자 미지정'} · {r.createdAt}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${SEVERITY_STYLE[r.severity]}`}>
                {SEVERITY_LABEL[r.severity]}
              </span>
              <button
                type="button"
                onClick={() => toggleResolved(r.id)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
              >
                {r.resolved ? '재오픈' : '해결 처리'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <Modal title="리스크 등록" onClose={() => setAdding(false)}>
          <RiskForm
            onCancel={() => setAdding(false)}
            onSubmit={(risk) => {
              onSave({ ...project, risks: [...project.risks, risk] })
              setAdding(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
