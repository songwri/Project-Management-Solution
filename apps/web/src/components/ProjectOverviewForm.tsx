import { useState, type FormEvent } from 'react'
import type { Project, ProjectOverview, ProjectScope } from '../types'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

export function ProjectOverviewForm({
  project,
  onSubmit,
  onCancel,
}: {
  project: Project
  onSubmit: (overview: ProjectOverview, scope: ProjectScope) => void
  onCancel: () => void
}) {
  const [objective, setObjective] = useState(project.overview.objective)
  const [sponsor, setSponsor] = useState(project.overview.sponsor)
  const [manager, setManager] = useState(project.overview.manager)
  const [members, setMembers] = useState(project.overview.members.join(', '))
  const [startDate, setStartDate] = useState(project.overview.startDate)
  const [endDate, setEndDate] = useState(project.overview.endDate)
  const [budget, setBudget] = useState(project.overview.budget ?? '')
  const [background, setBackground] = useState(project.overview.background ?? '')

  const [inScope, setInScope] = useState(project.scope.inScope.join('\n'))
  const [outOfScope, setOutOfScope] = useState(project.scope.outOfScope.join('\n'))
  const [plannedDeliverables, setPlannedDeliverables] = useState(project.scope.plannedDeliverables.join('\n'))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(
      {
        objective,
        sponsor,
        manager,
        members: members
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        startDate,
        endDate,
        budget: budget || undefined,
        background: background || undefined,
      },
      {
        inScope: toLines(inScope),
        outOfScope: toLines(outOfScope),
        plannedDeliverables: toLines(plannedDeliverables),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>프로젝트 목표</label>
        <textarea className={inputCls} rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>스폰서</label>
          <input className={inputCls} value={sponsor} onChange={(e) => setSponsor(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>PM(담당자)</label>
          <input className={inputCls} value={manager} onChange={(e) => setManager(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>팀원 (쉼표로 구분)</label>
        <input className={inputCls} value={members} onChange={(e) => setMembers(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>시작일</label>
          <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>종료(목표)일</label>
          <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>예산</label>
        <input className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>배경</label>
        <textarea className={inputCls} rows={2} value={background} onChange={(e) => setBackground(e.target.value)} />
      </div>

      <hr className="border-slate-200" />
      <p className="text-xs font-semibold text-slate-500">범위 (한 줄에 하나씩 입력)</p>
      <div>
        <label className={labelCls}>포함 범위</label>
        <textarea className={inputCls} rows={3} value={inScope} onChange={(e) => setInScope(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>제외 범위</label>
        <textarea className={inputCls} rows={2} value={outOfScope} onChange={(e) => setOutOfScope(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>계획된 산출물</label>
        <textarea
          className={inputCls}
          rows={2}
          value={plannedDeliverables}
          onChange={(e) => setPlannedDeliverables(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          취소
        </button>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          저장
        </button>
      </div>
    </form>
  )
}
