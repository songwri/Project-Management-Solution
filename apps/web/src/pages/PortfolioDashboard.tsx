import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { EventClickArg } from '@fullcalendar/core'
import { dataClient } from '../lib/dataClient'
import { portfolioToEvents } from '../lib/calendarEvents'
import type { Project, ProjectStatus } from '../types'
import { PROJECT_STATUS_LABEL } from '../types'
import { AppCalendar } from '../components/AppCalendar'
import { GanttChart, type GanttItem } from '../components/GanttChart'
import { ViewToggle } from '../components/ViewToggle'
import { ProjectCard } from '../components/ProjectCard'

type ViewMode = 'calendar' | 'gantt'

export function PortfolioDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [view, setView] = useState<ViewMode>('calendar')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')

  useEffect(() => {
    dataClient.listProjects().then(setProjects)
  }, [])

  const filtered = useMemo(() => {
    if (!projects) return []
    return statusFilter === 'all' ? projects : projects.filter((p) => p.status === statusFilter)
  }, [projects, statusFilter])

  const events = useMemo(() => portfolioToEvents(filtered), [filtered])

  const ganttItems: GanttItem[] = useMemo(
    () =>
      filtered.flatMap((p) =>
        p.schedule.map((task) => ({
          task,
          projectId: p.id,
          projectName: p.name,
          projectColor: p.color,
        })),
      ),
    [filtered],
  )

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of projects ?? []) counts[p.status] = (counts[p.status] ?? 0) + 1
    return counts
  }, [projects])

  function handleEventClick(arg: EventClickArg) {
    const projectId = arg.event.extendedProps.projectId as string | undefined
    if (projectId) navigate(`/projects/${projectId}`)
  }

  function handleGanttClick(item: GanttItem) {
    navigate(`/projects/${item.projectId}`)
  }

  if (!projects) {
    return <p className="text-slate-400 text-sm">불러오는 중...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">포트폴리오 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          전체 {projects.length}개 프로젝트의 통합 일정을 한눈에 확인하세요.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          label={`전체 ${projects.length}`}
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((s) => (
          <FilterChip
            key={s}
            label={`${PROJECT_STATUS_LABEL[s]} ${statusCounts[s] ?? 0}`}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {filtered.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
          ))}
        </div>
        <ViewToggle
          value={view}
          onChange={setView}
          options={[
            { value: 'calendar', label: '캘린더' },
            { value: 'gantt', label: '간트 차트' },
          ]}
        />
      </div>

      {view === 'calendar' ? (
        <AppCalendar events={events} onEventClick={handleEventClick} />
      ) : (
        <GanttChart items={ganttItems} viewMode="Month" onTaskClick={handleGanttClick} />
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">프로젝트 목록</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  )
}
