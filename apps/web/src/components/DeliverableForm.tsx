import { useState, type FormEvent } from 'react'
import type { Deliverable } from '../types'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function DeliverableForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (deliverable: Deliverable) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name || !link) return
    onSubmit({
      id: `d-${Date.now().toString(36)}`,
      name,
      type: type || '기타',
      link,
      submittedBy,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'submitted',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>산출물명</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>유형</label>
          <input
            className={inputCls}
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="보고서, 설계문서 등"
          />
        </div>
        <div>
          <label className={labelCls}>제출자</label>
          <input className={inputCls} value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>링크 (GitHub / SharePoint / Teams 등)</label>
        <input
          className={inputCls}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          required
        />
        <p className="mt-1 text-xs text-slate-400">
          큰 파일은 회사 SharePoint/Teams에 올린 뒤 공유 링크를 붙여넣으세요.
        </p>
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
