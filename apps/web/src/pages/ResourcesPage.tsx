import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { dataClient } from '../lib/dataClient'
import { useMasterData } from '../lib/MasterDataContext'
import type { Project } from '../types'
import { findTeam, teamAndDescendantIds, type Person } from '../masterData'
import { computePersonCapacity, currentMonthISO, overloadLevel, type PersonCapacity } from '../lib/capacity'

const LEVEL_STYLE: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-700',
  busy: 'bg-amber-100 text-amber-800',
  overloaded: 'bg-rose-100 text-rose-700',
}
const LEVEL_LABEL: Record<string, string> = { normal: '정상', busy: '바쁨', overloaded: '과부하' }
const BAR_COLOR: Record<string, string> = { normal: 'bg-emerald-500', busy: 'bg-amber-500', overloaded: 'bg-rose-500' }

function activeTaskCount(person: Person, projects: Project[]): number {
  return projects.reduce(
    (sum, p) => sum + p.schedule.filter((t) => t.assignee === person.id && t.progress < 100).length,
    0,
  )
}

export function ResourcesPage() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const { masterData, save } = useMasterData()
  const [month, setMonth] = useState(currentMonthISO())
  const [teamFilter, setTeamFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    dataClient.listProjects().then(setProjects)
  }, [])

  const visiblePeople = useMemo(() => {
    if (teamFilter === 'all') return masterData.people
    const ids = teamAndDescendantIds(masterData.teams, teamFilter)
    return masterData.people.filter((p) => ids.has(p.teamId))
  }, [masterData.people, masterData.teams, teamFilter])

  const rows = useMemo(() => {
    if (!projects) return []
    return visiblePeople
      .map((person) => ({
        person,
        capacity: computePersonCapacity(person, projects, masterData.overtimeLogs, month),
        activeTasks: activeTaskCount(person, projects),
      }))
      .sort((a, b) => b.capacity.utilization - a.capacity.utilization)
  }, [visiblePeople, projects, masterData.overtimeLogs, month])

  function updateOvertime(personId: string, hours: number) {
    const others = masterData.overtimeLogs.filter((o) => !(o.personId === personId && o.month === month))
    const next =
      hours > 0
        ? [...others, { id: `ot-${personId}-${month}`, personId, month, hours }]
        : others
    save({ ...masterData, overtimeLogs: next })
  }

  if (!projects) return <p className="text-slate-400 text-sm">불러오는 중...</p>

  const overloadedCount = rows.filter((r) => overloadLevel(r.capacity.utilization) === 'overloaded').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">리소스 · 가동률 현황</h1>
        <p className="mt-1 text-sm text-slate-500">
          일 8시간 기준 1 Man/Month 가동률입니다. 배정된 일정만으로도 100%를 넘을 수 있고, 야근 시간을 입력하면
          추가로 반영됩니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">기준월</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">조직</label>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
          >
            <option value="all">전체</option>
            {masterData.teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        {overloadedCount > 0 && (
          <span className="text-xs font-medium text-rose-600">⚠ 과부하 {overloadedCount}명</span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          설정 &gt; 담당자 관리에서 먼저 담당자를 등록하세요.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">담당자</th>
                <th className="text-left font-medium px-4 py-2.5">팀 · 직급</th>
                <th className="text-left font-medium px-4 py-2.5">참여 프로젝트</th>
                <th className="text-left font-medium px-4 py-2.5">진행중 작업</th>
                <th className="text-left font-medium px-4 py-2.5">배정 일수</th>
                <th className="text-left font-medium px-4 py-2.5">야근(h)</th>
                <th className="text-left font-medium px-4 py-2.5">가동률</th>
                <th className="text-left font-medium px-4 py-2.5">상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ person, capacity, activeTasks }) => (
                <ResourceRow
                  key={person.id}
                  person={person}
                  capacity={capacity}
                  activeTasks={activeTasks}
                  projects={projects}
                  expanded={expanded === person.id}
                  onToggle={() => setExpanded(expanded === person.id ? null : person.id)}
                  onOvertimeChange={(hours) => updateOvertime(person.id, hours)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ResourceRow({
  person,
  capacity,
  activeTasks,
  projects,
  expanded,
  onToggle,
  onOvertimeChange,
}: {
  person: Person
  capacity: PersonCapacity
  activeTasks: number
  projects: Project[]
  expanded: boolean
  onToggle: () => void
  onOvertimeChange: (hours: number) => void
}) {
  const { masterData } = useMasterData()
  const team = findTeam(masterData.teams, person.teamId)
  const level = overloadLevel(capacity.utilization)
  const pct = Math.round(capacity.utilization * 100)

  const personProjects = projects.filter((p) => p.assignments.some((a) => a.personId === person.id))

  return (
    <Fragment>
      <tr className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-2.5 font-medium text-slate-800">{person.name}</td>
        <td className="px-4 py-2.5 text-slate-500">
          {team?.name ?? '-'} · {person.title || '-'}
        </td>
        <td className="px-4 py-2.5 text-slate-500">{capacity.projectCount}개</td>
        <td className="px-4 py-2.5 text-slate-500">{activeTasks}건</td>
        <td className="px-4 py-2.5 text-slate-500">
          {capacity.assignedDays}일 / {capacity.standardDays}일
        </td>
        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            min={0}
            defaultValue={capacity.overtimeHours || ''}
            onBlur={(e) => onOvertimeChange(Number(e.target.value) || 0)}
            className="w-16 rounded border border-slate-200 px-1.5 py-1 text-xs"
          />
        </td>
        <td className="px-4 py-2.5 w-40">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full ${BAR_COLOR[level]}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 shrink-0">{pct}%</span>
          </div>
        </td>
        <td className="px-4 py-2.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${LEVEL_STYLE[level]}`}>
            {LEVEL_LABEL[level]}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-slate-100 bg-slate-50">
          <td colSpan={8} className="px-4 py-3">
            {personProjects.length === 0 ? (
              <p className="text-xs text-slate-400">배정된 프로젝트가 없습니다.</p>
            ) : (
              <ul className="space-y-1">
                {personProjects.map((p) => {
                  const role = p.assignments.find((a) => a.personId === person.id)?.role
                  return (
                    <li key={p.id} className="flex items-center gap-2 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <Link to={`/projects/${p.id}`} className="font-medium text-slate-700 hover:underline">
                        {p.name}
                      </Link>
                      <span className="text-slate-400">
                        · {role ? labelForRole(masterData.projectRoles, role) : ''}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </td>
        </tr>
      )}
    </Fragment>
  )
}

function labelForRole(roles: { key: string; label: string }[], key: string): string {
  return roles.find((r) => r.key === key)?.label ?? key
}
