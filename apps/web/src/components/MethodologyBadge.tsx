import { DEFAULT_METHODOLOGIES, labelFrom, type Methodology } from '../types'
import { useMasterData } from '../lib/MasterDataContext'

const STYLES: Record<string, string> = {
  waterfall: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  agile: 'bg-teal-50 text-teal-700 border-teal-200',
  hybrid: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
}
const FALLBACK_STYLE = 'bg-slate-50 text-slate-700 border-slate-200'

export function MethodologyBadge({ methodology }: { methodology: Methodology }) {
  const { masterData } = useMasterData()
  const options = masterData.methodologies.length > 0 ? masterData.methodologies : DEFAULT_METHODOLOGIES
  const label = labelFrom(options, methodology)
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STYLES[methodology] ?? FALLBACK_STYLE}`}
    >
      {label}
    </span>
  )
}
