import { Link } from 'react-router-dom'
import { overallProgress, openRiskCount, projectManagerAssignment, type Project } from '../types'
import { personLabel } from '../masterData'
import { useMasterData } from '../lib/MasterDataContext'
import { StatusBadge } from './StatusBadge'
import { MethodologyBadge } from './MethodologyBadge'
import { HealthDot } from './HealthDot'

export function ProjectCard({ project }: { project: Project }) {
  const { masterData } = useMasterData()
  const progress = overallProgress(project)
  const risks = openRiskCount(project)
  const manager = projectManagerAssignment(project)
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <HealthDot health={project.health} />
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <MethodologyBadge methodology={project.methodology} />
        {risks > 0 && (
          <span className="text-xs font-medium text-rose-600">⚠ 리스크 {risks}건</span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-500 line-clamp-2">{project.overview.objective}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          {project.overview.startDate} ~ {project.overview.endDate}
        </span>
        <span>{manager ? `${personLabel(masterData.people, manager.personId)} 담당` : '담당자 미지정'}</span>
      </div>
      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: project.color }}
          />
        </div>
        <div className="mt-1 text-right text-xs text-slate-400">진행률 {progress}%</div>
      </div>
    </Link>
  )
}
