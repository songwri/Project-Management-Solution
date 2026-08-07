import { METHODOLOGY_LABEL, type Methodology } from '../types'

const STYLES: Record<Methodology, string> = {
  waterfall: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  agile: 'bg-teal-50 text-teal-700 border-teal-200',
  hybrid: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
}

export function MethodologyBadge({ methodology }: { methodology: Methodology }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STYLES[methodology]}`}
    >
      {METHODOLOGY_LABEL[methodology]}
    </span>
  )
}
