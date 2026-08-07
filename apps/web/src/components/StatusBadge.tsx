import { DEFAULT_STATUSES, labelFrom, type ProjectStatus } from '../types'
import { useMasterData } from '../lib/MasterDataContext'

const STYLES: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  closing: 'bg-amber-100 text-amber-800',
  closed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-rose-100 text-rose-700',
}
const FALLBACK_STYLE = 'bg-slate-100 text-slate-700'

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { masterData } = useMasterData()
  const options = masterData.statuses.length > 0 ? masterData.statuses : DEFAULT_STATUSES
  const label = labelFrom(options, status)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status] ?? FALLBACK_STYLE}`}>
      {label}
    </span>
  )
}
