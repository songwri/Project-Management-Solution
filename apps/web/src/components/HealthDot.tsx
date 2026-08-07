import { DEFAULT_HEALTH_LEVELS, labelFrom, type HealthStatus } from '../types'
import { useMasterData } from '../lib/MasterDataContext'

const COLOR: Record<string, string> = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  off_track: 'bg-rose-500',
}
const FALLBACK_COLOR = 'bg-slate-400'

export function HealthDot({ health, withLabel = false }: { health: HealthStatus; withLabel?: boolean }) {
  const { masterData } = useMasterData()
  const options = masterData.healthLevels.length > 0 ? masterData.healthLevels : DEFAULT_HEALTH_LEVELS
  const label = labelFrom(options, health)
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${COLOR[health] ?? FALLBACK_COLOR}`} />
      {withLabel && <span className="text-xs text-slate-500">{label}</span>}
    </span>
  )
}
