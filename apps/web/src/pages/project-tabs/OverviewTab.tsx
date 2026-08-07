import { useState } from 'react'
import type { HealthStatus, Methodology, Project, ProjectStatus } from '../../types'
import { HEALTH_LABEL, METHODOLOGY_LABEL, PROJECT_STATUS_LABEL, budgetConsumptionPct } from '../../types'
import { Modal } from '../../components/Modal'
import { ProjectOverviewForm } from '../../components/ProjectOverviewForm'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value || '-'}</dd>
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">등록된 항목이 없습니다.</p>
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function OverviewTab({ project, onSave }: { project: Project; onSave: (p: Project) => void }) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">진행 상태</label>
            <select
              value={project.status}
              onChange={(e) => onSave({ ...project, status: e.target.value as ProjectStatus })}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
            >
              {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">방법론</label>
            <select
              value={project.methodology}
              onChange={(e) => onSave({ ...project, methodology: e.target.value as Methodology })}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
            >
              {(Object.keys(METHODOLOGY_LABEL) as Methodology[]).map((m) => (
                <option key={m} value={m}>
                  {METHODOLOGY_LABEL[m]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">건강도</label>
            <select
              value={project.health}
              onChange={(e) => onSave({ ...project, health: e.target.value as HealthStatus })}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
            >
              {(Object.keys(HEALTH_LABEL) as HealthStatus[]).map((h) => (
                <option key={h} value={h}>
                  {HEALTH_LABEL[h]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium hover:bg-slate-100"
        >
          개요 수정
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">프로젝트 개요</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="목표" value={project.overview.objective} />
          <InfoRow label="배경" value={project.overview.background ?? ''} />
          <InfoRow label="스폰서" value={project.overview.sponsor} />
          <InfoRow label="PM" value={project.overview.manager} />
          <InfoRow label="팀원" value={project.overview.members.join(', ')} />
          <InfoRow label="예산" value={project.overview.budget ?? ''} />
          <InfoRow label="기간" value={`${project.overview.startDate} ~ ${project.overview.endDate}`} />
        </dl>
        {project.budgetTracking && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>예산 소진율</span>
              <span>
                {project.budgetTracking.spent.toLocaleString()} / {project.budgetTracking.planned.toLocaleString()}원
                ({budgetConsumptionPct(project)}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full ${
                  (budgetConsumptionPct(project) ?? 0) > 100 ? 'bg-rose-500' : 'bg-slate-700'
                }`}
                style={{ width: `${Math.min(100, budgetConsumptionPct(project) ?? 0)}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">프로젝트 범위</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 mb-2">포함 범위</h3>
            <BulletList items={project.scope.inScope} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 mb-2">제외 범위</h3>
            <BulletList items={project.scope.outOfScope} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 mb-2">계획된 산출물</h3>
            <BulletList items={project.scope.plannedDeliverables} />
          </div>
        </div>
      </section>

      {editing && (
        <Modal title="프로젝트 개요 수정" onClose={() => setEditing(false)}>
          <ProjectOverviewForm
            project={project}
            onCancel={() => setEditing(false)}
            onSubmit={(overview, scope) => {
              onSave({ ...project, overview, scope })
              setEditing(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
