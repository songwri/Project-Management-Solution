import { Link } from 'react-router-dom'
import { budgetConsumptionPct, openRiskCount, overallProgress, projectManagerAssignment, RESERVED_STATUS, type Project } from '../types'
import { personLabel } from '../masterData'
import { useMasterData } from '../lib/MasterDataContext'
import { StatusBadge } from './StatusBadge'
import { MethodologyBadge } from './MethodologyBadge'
import { HealthDot } from './HealthDot'

function relativeUpdatedAt(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return '오늘'
  if (days === 1) return '어제'
  return `${days}일 전`
}

export function ProjectTable({ projects }: { projects: Project[] }) {
  const { masterData } = useMasterData()
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="text-left font-medium px-4 py-2.5">프로젝트</th>
            <th className="text-left font-medium px-4 py-2.5">PM</th>
            <th className="text-left font-medium px-4 py-2.5">방법론</th>
            <th className="text-left font-medium px-4 py-2.5">상태</th>
            <th className="text-left font-medium px-4 py-2.5">건강도</th>
            <th className="text-left font-medium px-4 py-2.5">진행률</th>
            <th className="text-left font-medium px-4 py-2.5">예산 소진율</th>
            <th className="text-left font-medium px-4 py-2.5">리스크</th>
            <th className="text-left font-medium px-4 py-2.5">최근 업데이트</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const budgetPct = budgetConsumptionPct(p)
            const risks = openRiskCount(p)
            const progress = overallProgress(p)
            const manager = projectManagerAssignment(p)
            const isClosed = p.status === RESERVED_STATUS.CLOSED
            return (
              <tr key={p.id} className={`border-t border-slate-100 hover:bg-slate-50 ${isClosed ? 'opacity-50' : ''}`}>
                <td className="px-4 py-2.5">
                  <Link to={`/projects/${p.id}`} className="flex items-center gap-2 font-medium text-slate-800 hover:underline">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {manager ? personLabel(masterData.people, manager.personId) : '-'}
                </td>
                <td className="px-4 py-2.5">
                  <MethodologyBadge methodology={p.methodology} />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-2.5">
                  <HealthDot health={p.health} withLabel />
                </td>
                <td className="px-4 py-2.5 w-32">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 tabular-nums">{progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{budgetPct === null ? '-' : `${budgetPct}%`}</td>
                <td className="px-4 py-2.5">
                  {risks > 0 ? (
                    <span className="text-rose-600 font-medium">{risks}건</span>
                  ) : (
                    <span className="text-slate-400">없음</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-400">{relativeUpdatedAt(p.updatedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
