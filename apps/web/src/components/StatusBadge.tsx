import { PROJECT_STATUS_LABEL, type ProjectStatus } from '../types'

const STYLES: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  closing: 'bg-amber-100 text-amber-800',
  closed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-rose-100 text-rose-700',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {PROJECT_STATUS_LABEL[status]}
    </span>
  )
}
