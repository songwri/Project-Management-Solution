import { useState } from 'react'
import type { HealthStatus, Methodology, Project, ProjectStatus } from '../../types'
import { DEFAULT_HEALTH_LEVELS, DEFAULT_METHODOLOGIES, DEFAULT_STATUSES, budgetConsumptionPct, labelFrom } from '../../types'
import { PM_ROLE_KEY, findPerson, findTeam } from '../../masterData'
import { useMasterData } from '../../lib/MasterDataContext'
import { Modal } from '../../components/Modal'
import { ProjectOverviewForm } from '../../components/ProjectOverviewForm'
import { AssignmentForm } from '../../components/AssignmentForm'

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
  const [addingAssignment, setAddingAssignment] = useState(false)
  const { masterData } = useMasterData()

  const statuses = masterData.statuses.length > 0 ? masterData.statuses : DEFAULT_STATUSES
  const methodologies = masterData.methodologies.length > 0 ? masterData.methodologies : DEFAULT_METHODOLOGIES
  const healthLevels = masterData.healthLevels.length > 0 ? masterData.healthLevels : DEFAULT_HEALTH_LEVELS
  const roles = masterData.projectRoles

  function removeAssignment(personId: string) {
    onSave({ ...project, assignments: project.assignments.filter((a) => a.personId !== personId) })
  }

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
              {statuses.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
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
              {methodologies.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
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
              {healthLevels.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">담당자</h2>
          <button
            type="button"
            onClick={() => setAddingAssignment(true)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
          >
            + 담당자 추가
          </button>
        </div>
        {project.assignments.length === 0 ? (
          <p className="text-sm text-slate-400">등록된 담당자가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {project.assignments.map((a) => {
              const person = findPerson(masterData.people, a.personId)
              const team = person ? findTeam(masterData.teams, person.teamId) : undefined
              return (
                <li key={a.personId} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium text-slate-800">{person?.name ?? '알 수 없음'}</span>
                    {person && <span className="text-slate-400"> · {team?.name ?? '-'} · {person.title}</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.role === PM_ROLE_KEY ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {labelFrom(roles, a.role)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAssignment(a.personId)}
                      className="text-xs text-slate-400 hover:text-rose-600"
                    >
                      제거
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
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
            onSubmit={(overview, scope, budgetTracking) => {
              onSave({ ...project, overview, scope, budgetTracking })
              setEditing(false)
            }}
          />
        </Modal>
      )}

      {addingAssignment && (
        <Modal title="담당자 추가" onClose={() => setAddingAssignment(false)}>
          <AssignmentForm
            people={masterData.people}
            roles={roles.length > 0 ? roles : [{ key: 'pm', label: 'PM' }, { key: 'member', label: '멤버' }]}
            excludePersonIds={project.assignments.map((a) => a.personId)}
            onCancel={() => setAddingAssignment(false)}
            onSubmit={(assignment) => {
              onSave({ ...project, assignments: [...project.assignments, assignment] })
              setAddingAssignment(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
