import { useState, type FormEvent } from 'react'
import type { BudgetTracking, Project, ProjectOverview, ProjectScope } from '../types'

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
  onSubmit: (overview: ProjectOverview, scope: ProjectScope, budgetTracking?: BudgetTracking) => void
  onCancel: () => void
}) {
  const [objective, setObjective] = useState(project.overview.objective)
  const [sponsor, setSponsor] = useState(project.overview.sponsor)
  const [startDate, setStartDate] = useState(project.overview.startDate)
  const [endDate, setEndDate] = useState(project.overview.endDate)
  const [budget, setBudget] = useState(project.overview.budget ?? '')
  const [background, setBackground] = useState(project.overview.background ?? '')
  const [budgetPlanned, setBudgetPlanned] = useState(String(project.budgetTracking?.planned ?? ''))
  const [budgetSpent, setBudgetSpent] = useState(String(project.budgetTracking?.spent ?? ''))

  const [inScope, setInScope] = useState(project.scope.inScope.join('\n'))
  const [outOfScope, setOutOfScope] = useState(project.scope.outOfScope.join('\n'))
  const [plannedDeliverables, setPlannedDeliverables] = useState(project.scope.plannedDeliverables.join('\n'))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const planned = Number(budgetPlanned)
    const spent = Number(budgetSpent)
    onSubmit(
      {
        objective,
        sponsor,
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
      budgetPlanned ? { planned, spent: spent || 0 } : undefined,
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>프로젝트 목표</label>
        <textarea className={inputCls} rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>스폰서</label>
        <input className={inputCls} value={sponsor} onChange={(e) => setSponsor(e.target.value)} />
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
        <label className={labelCls}>예산 (표시용 텍스트, 예: "1억 2천만원")</label>
        <input className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>예산 소진율 계산용 - 계획(원)</label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={budgetPlanned}
            onChange={(e) => setBudgetPlanned(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>집행(원)</label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={budgetSpent}
            onChange={(e) => setBudgetSpent(e.target.value)}
          />
        </div>
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
