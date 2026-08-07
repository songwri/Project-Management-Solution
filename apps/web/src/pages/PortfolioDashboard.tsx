import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { EventClickArg } from '@fullcalendar/core'
import { dataClient } from '../lib/dataClient'
import { portfolioToEvents } from '../lib/calendarEvents'
import type { Methodology, Project, ProjectStatus } from '../types'
import { DEFAULT_METHODOLOGIES, DEFAULT_STATUSES, RESERVED_STATUS } from '../types'
import { useMasterData } from '../lib/MasterDataContext'
import { teamAndDescendantIds } from '../masterData'
import { AppCalendar } from '../components/AppCalendar'
import { GanttChart, type GanttItem } from '../components/GanttChart'
import { ViewToggle } from '../components/ViewToggle'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectTable } from '../components/ProjectTable'
import { DonutChart, type DonutSlice } from '../components/DonutChart'
import { YearBarChart } from '../components/YearBarChart'

type TimelineView = 'calendar' | 'gantt'
type ListView = 'simple' | 'detailed'

const STAGE_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#e87ba4']

export function PortfolioDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const { masterData } = useMasterData()

  const [projects, setProjects] = useState<Project[] | null>(null)
  const [timelineView, setTimelineView] = useState<TimelineView>('calendar')
  const [listView, setListView] = useState<ListView>('detailed')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [methodologyFilter, setMethodologyFilter] = useState<Methodology | 'all'>('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const statuses = masterData.statuses.length > 0 ? masterData.statuses : DEFAULT_STATUSES
  const methodologies = masterData.methodologies.length > 0 ? masterData.methodologies : DEFAULT_METHODOLOGIES

  useEffect(() => {
    dataClient.listProjects().then(setProjects)
  }, [])

  const teamScoped = useMemo(() => {
    if (!projects) return []
    if (teamFilter === 'all') return projects
    const ids = teamAndDescendantIds(masterData.teams, teamFilter)
    return projects.filter((p) => p.ownerTeamId && ids.has(p.ownerTeamId))
  }, [projects, teamFilter, masterData.teams])

  const filtered = useMemo(() => {
    return teamScoped.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (methodologyFilter !== 'all' && p.methodology !== methodologyFilter) return false
      if (query && !p.name.toLowerCase().includes(query) && !p.overview.objective.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [teamScoped, statusFilter, methodologyFilter, query])

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
    for (const p of teamScoped) counts[p.status] = (counts[p.status] ?? 0) + 1
    return counts
  }, [teamScoped])

  const stageSlices: DonutSlice[] = useMemo(() => {
    const active = teamScoped.filter((p) => p.status !== RESERVED_STATUS.CLOSED)
    const nonClosed = statuses.filter((s) => s.key !== RESERVED_STATUS.CLOSED)
    return nonClosed
      .map((s, i) => ({
        key: s.key,
        label: s.label,
        value: active.filter((p) => p.status === s.key).length,
        color: STAGE_COLORS[i % STAGE_COLORS.length],
      }))
      .filter((s) => s.value > 0)
  }, [teamScoped, statuses])

  const yearCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of teamScoped) {
      const year = p.overview.startDate?.slice(0, 4)
      if (!year) continue
      counts.set(year, (counts.get(year) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([year, count]) => ({ year, count }))
  }, [teamScoped])

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
            <>전체 {teamScoped.length}개 프로젝트의 통합 일정을 한눈에 확인하세요.</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">진행 단계 구성 (진행중 프로젝트)</h2>
          {stageSlices.length === 0 ? (
            <p className="text-sm text-slate-400">진행중인 프로젝트가 없습니다.</p>
          ) : (
            <DonutChart slices={stageSlices} />
          )}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">연도별 프로젝트 수 (시작연도 기준)</h2>
          {yearCounts.length === 0 ? (
            <p className="text-sm text-slate-400">데이터가 없습니다.</p>
          ) : (
            <YearBarChart data={yearCounts} />
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip label={`전체 ${teamScoped.length}`} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        {statuses.map((s) => (
          <FilterChip
            key={s.key}
            label={`${s.label} ${statusCounts[s.key] ?? 0}`}
            active={statusFilter === s.key}
            onClick={() => setStatusFilter(s.key)}
          />
        ))}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <FilterChip label="전체 방법론" active={methodologyFilter === 'all'} onClick={() => setMethodologyFilter('all')} />
        {methodologies.map((m) => (
          <FilterChip
            key={m.key}
            label={m.label}
            active={methodologyFilter === m.key}
            onClick={() => setMethodologyFilter(m.key)}
          />
        ))}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600"
        >
          <option value="all">전체 조직</option>
          {masterData.teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
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
              { value: 'detailed', label: '표 보기' },
              { value: 'simple', label: '카드 보기' },
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
