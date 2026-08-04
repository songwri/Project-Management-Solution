import { useState } from 'react'
import type { Project } from '../../types'
import { Modal } from '../../components/Modal'
import { MeetingForm } from '../../components/MeetingForm'

export function MeetingsTab({ project, onSave }: { project: Project; onSave: (p: Project) => void }) {
  const [adding, setAdding] = useState(false)
  const sorted = [...project.meetingMinutes].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 회의록 추가
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          등록된 회의록이 없습니다.
        </p>
      )}

      <div className="space-y-3">
        {sorted.map((m) => (
          <article key={m.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{m.title}</h3>
              <span className="text-xs text-slate-400">{m.date}</span>
            </div>
            {m.attendees.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">참석자: {m.attendees.join(', ')}</p>
            )}
            {m.agenda && (
              <div className="mt-2 text-sm">
                <span className="text-xs font-medium text-slate-400">안건 </span>
                <span className="text-slate-700">{m.agenda}</span>
              </div>
            )}
            {m.decisions && (
              <div className="mt-1 text-sm">
                <span className="text-xs font-medium text-slate-400">결정사항 </span>
                <span className="text-slate-700">{m.decisions}</span>
              </div>
            )}
            {m.actionItems.length > 0 && (
              <ul className="mt-2 space-y-1">
                {m.actionItems.map((a) => (
                  <li key={a.id} className="text-xs text-slate-600 flex items-center gap-1.5">
                    <span className={a.done ? 'text-emerald-500' : 'text-slate-300'}>●</span>
                    {a.description} — {a.owner}
                    {a.dueDate ? ` (${a.dueDate})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      {adding && (
        <Modal title="회의록 추가" onClose={() => setAdding(false)}>
          <MeetingForm
            onCancel={() => setAdding(false)}
            onSubmit={(meeting) => {
              onSave({ ...project, meetingMinutes: [...project.meetingMinutes, meeting] })
              setAdding(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
