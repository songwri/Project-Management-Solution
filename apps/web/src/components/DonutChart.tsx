export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
}

// Plain CSS conic-gradient donut — no chart library needed. Always paired
// with a legend (label + count) so identity never rides on color alone.
export function DonutChart({ slices, size = 150, thickness = 26 }: { slices: DonutSlice[]; size?: number; thickness?: number }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  let acc = 0
  const stops = slices
    .map((s) => {
      const start = total ? (acc / total) * 100 : 0
      acc += s.value
      const end = total ? (acc / total) * 100 : 0
      return `${s.color} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: total > 0 ? `conic-gradient(${stops})` : '#e2e8f0' }}
        />
        <div
          className="absolute rounded-full bg-white flex items-center justify-center"
          style={{ inset: thickness }}
        >
          <span className="text-xl font-semibold text-slate-800">{total}</span>
        </div>
      </div>
      <ul className="space-y-1.5 min-w-0">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600 truncate">{s.label}</span>
            <span className="font-medium text-slate-800 tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
