import { useState } from 'react'
import type { Project, DeliverableStatus } from '../../types'
import { canCloseProject } from '../../types'
import { Modal } from '../../components/Modal'
import { DeliverableForm } from '../../components/DeliverableForm'

const STATUS_STYLE: Record<DeliverableStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
}
const STATUS_LABEL: Record<DeliverableStatus, string> = {
  draft: '초안',
  submitted: '제출완료',
  approved: '승인완료',
}

export function DeliverablesTab({ project, onSave }: { project: Project; onSave: (p: Project) => void }) {
  const [adding, setAdding] = useState(false)
  const closable = canCloseProject(project)
  const alreadyClosed = project.status === 'closed'

  function updateStatus(id: string, status: DeliverableStatus) {
    onSave({
      ...project,
      deliverables: project.deliverables.map((d) => (d.id === id ? { ...d, status } : d)),
    })
  }

  function closeProject() {
    onSave({ ...project, status: 'closed' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 산출물 등록
        </button>
      </div>

      {project.deliverables.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          등록된 산출물이 없습니다.
        </p>
      )}

      <div className="space-y-2">
        {project.deliverables.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="min-w-0">
              <a
                href={d.link}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-900 hover:underline"
              >
                {d.name}
              </a>
              <p className="text-xs text-slate-500 mt-0.5">
                {d.type} · {d.submittedBy || '제출자 미상'} · {d.submittedAt}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[d.status]}`}>
                {STATUS_LABEL[d.status]}
              </span>
              {d.status !== 'approved' && (
                <button
                  type="button"
                  onClick={() => updateStatus(d.id, 'approved')}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
                >
                  승인 처리
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">프로젝트 종료</h2>
        <p className="mt-1 text-sm text-slate-500">
          산출물을 1건 이상 등록해야 프로젝트를 종료 처리할 수 있습니다.
        </p>
        <button
          type="button"
          disabled={!closable || alreadyClosed}
          onClick={closeProject}
          className="mt-3 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {alreadyClosed ? '종료된 프로젝트입니다' : '프로젝트 종료 처리'}
        </button>
      </section>

      {adding && (
        <Modal title="산출물 등록" onClose={() => setAdding(false)}>
          <DeliverableForm
            onCancel={() => setAdding(false)}
            onSubmit={(deliverable) => {
              onSave({ ...project, deliverables: [...project.deliverables, deliverable] })
              setAdding(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
