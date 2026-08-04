import { useState, type FormEvent } from 'react'
import type { MeetingMinute } from '../types'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function MeetingForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (meeting: MeetingMinute) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [attendees, setAttendees] = useState('')
  const [agenda, setAgenda] = useState('')
  const [decisions, setDecisions] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title || !date) return
    onSubmit({
      id: `m-${Date.now().toString(36)}`,
      title,
      date,
      attendees: attendees
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      agenda,
      decisions,
      actionItems: [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>회의명</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>일시</label>
        <input
          type="date"
          className={inputCls}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelCls}>참석자 (쉼표로 구분)</label>
        <input
          className={inputCls}
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          placeholder="홍길동, 김철수"
        />
      </div>
      <div>
        <label className={labelCls}>안건</label>
        <textarea className={inputCls} rows={2} value={agenda} onChange={(e) => setAgenda(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>결정사항</label>
        <textarea
          className={inputCls}
          rows={2}
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
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
          저장
        </button>
      </div>
    </form>
  )
}
