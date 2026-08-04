import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dataClient } from '../lib/dataClient'
import type { Project } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { OverviewTab } from './project-tabs/OverviewTab'
import { ScheduleTab } from './project-tabs/ScheduleTab'
import { MeetingsTab } from './project-tabs/MeetingsTab'
import { DeliverablesTab } from './project-tabs/DeliverablesTab'

type TabKey = 'overview' | 'schedule' | 'meetings' | 'deliverables'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '개요 · 범위' },
  { key: 'schedule', label: '일정' },
  { key: 'meetings', label: '회의록' },
  { key: 'deliverables', label: '산출물 · 종료' },
]

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [tab, setTab] = useState<TabKey>('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    dataClient.getProject(id).then((p) => setProject(p ?? null))
  }, [id])

  async function persist(next: Project) {
    setProject(next)
    setError(null)
    try {
      const saved = await dataClient.saveProject(next)
      setProject(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    }
  }

  if (!id) return null
  if (!project) return <p className="text-slate-400 text-sm">불러오는 중...</p>

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="text-xl font-semibold text-slate-900">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{project.overview.objective}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 text-rose-700 text-sm px-3.5 py-2.5 border border-rose-200">
          {error}
        </div>
      )}

      <div className="border-b border-slate-200 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab project={project} onSave={persist} />}
      {tab === 'schedule' && <ScheduleTab project={project} onSave={persist} />}
      {tab === 'meetings' && <MeetingsTab project={project} onSave={persist} />}
      {tab === 'deliverables' && <DeliverablesTab project={project} onSave={persist} />}
    </div>
  )
}
