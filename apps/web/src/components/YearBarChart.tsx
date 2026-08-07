export interface YearCount {
  year: string
  count: number
}

const BAR_COLOR = '#2a78d6'

export function YearBarChart({ data }: { data: YearCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="flex items-end gap-4 h-32">
      {data.map((d) => (
        <div key={d.year} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
          <span className="text-xs font-medium text-slate-600 tabular-nums">{d.count}</span>
          <div
            className="w-full rounded-t"
            style={{ height: `${Math.max(2, (d.count / max) * 100)}%`, backgroundColor: BAR_COLOR }}
          />
          <span className="text-xs text-slate-400">{d.year}</span>
        </div>
      ))}
    </div>
  )
}
