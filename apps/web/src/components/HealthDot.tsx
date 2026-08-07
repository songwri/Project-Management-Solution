import { HEALTH_LABEL, type HealthStatus } from '../types'

const COLOR: Record<HealthStatus, string> = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  off_track: 'bg-rose-500',
}

export function HealthDot({ health, withLabel = false }: { health: HealthStatus; withLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={HEALTH_LABEL[health]}>
      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${COLOR[health]}`} />
      {withLabel && <span className="text-xs text-slate-500">{HEALTH_LABEL[health]}</span>}
    </span>
  )
}
