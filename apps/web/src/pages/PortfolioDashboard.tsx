import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { EventClickArg } from '@fullcalendar/core'
import { dataClient } from '../lib/dataClient'
import { portfolioToEvents } from '../lib/calendarEvents'
import type { Methodology, Project, ProjectStatus } from '../types'
import { METHODOLOGY_LABEL, PROJECT_STATUS_LABEL } from '../types'
import { AppCalendar } from '../components/AppCalendar'
import { GanttChart, type GanttItem } from '../components/GanttChart'
import { ViewToggle } from '../components/ViewToggle'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectTable } from '../components/ProjectTable'

type TimelineView = 'calendar' | 'gantt'
type ListView = 'simple' | 'detailed'

export function PortfolioDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim().toLowerCase() ?? ''

  const [projects, setProjects] = useState<Project[] | null>(null)
  const [timelineView, setTimelineView] = useState<TimelineView>('calendar')
  const [listView, setListView] = useState<ListView>('simple')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [methodologyFilter, setMethodologyFilter] = useState<Methodology | 'all'>('all')

  useEffect(() => {
    dataClient.listProjects().then(setProjects)
  }, [])

  const filtered = useMemo(() => {
    if (!projects) return []
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (methodologyFilter !== 'all' && p.methodology !== methodologyFilter) return false
      if (query && !p.name.toLowerCase().includes(query) && !p.overview.objective.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [projects, statusFilter, methodologyFilter, query])

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
          {query ? (
            <>
              "{query}" 검색 결과 {filtered.length}건
            </>
          ) : (
            <>전체 {projects.length}개 프로젝트의 통합 일정을 한눈에 확인하세요.</>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip label={`전체 ${projects.length}`} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((s) => (
          <FilterChip
            key={s}
            label={`${PROJECT_STATUS_LABEL[s]} ${statusCounts[s] ?? 0}`}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          />
        ))}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <FilterChip label="전체 방법론" active={methodologyFilter === 'all'} onClick={() => setMethodologyFilter('all')} />
        {(Object.keys(METHODOLOGY_LABEL) as Methodology[]).map((m) => (
          <FilterChip
            key={m}
            label={METHODOLOGY_LABEL[m]}
            active={methodologyFilter === m}
            onClick={() => setMethodologyFilter(m)}
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
          value={timelineView}
          onChange={setTimelineView}
          options={[
            { value: 'calendar', label: '캘린더' },
            { value: 'gantt', label: '간트 차트' },
          ]}
        />
      </div>

      {timelineView === 'calendar' ? (
        <AppCalendar events={events} onEventClick={handleEventClick} />
      ) : (
        <GanttChart items={ganttItems} viewMode="Month" onTaskClick={handleGanttClick} />
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">프로젝트 목록</h2>
          <ViewToggle
            value={listView}
            onChange={setListView}
            options={[
              { value: 'simple', label: '간단 보기' },
              { value: 'detailed', label: '상세 보기' },
            ]}
          />
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            조건에 맞는 프로젝트가 없습니다.
          </p>
        ) : listView === 'simple' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <ProjectTable projects={filtered} />
        )}
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
