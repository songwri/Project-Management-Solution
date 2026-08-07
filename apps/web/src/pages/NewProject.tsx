import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataClient } from '../lib/dataClient'
import { DEFAULT_METHODOLOGIES, type Methodology } from '../types'
import { useMasterData } from '../lib/MasterDataContext'

const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#db2777']

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function NewProject() {
  const navigate = useNavigate()
  const { masterData } = useMasterData()
  const methodologies = masterData.methodologies.length > 0 ? masterData.methodologies : DEFAULT_METHODOLOGIES

  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [sponsor, setSponsor] = useState('')
  const [managerId, setManagerId] = useState('')
  const [ownerTeamId, setOwnerTeamId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [methodology, setMethodology] = useState<Methodology>('waterfall')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const project = await dataClient.createProject({
        name,
        objective,
        sponsor,
        managerId,
        ownerTeamId: ownerTeamId || undefined,
        startDate,
        endDate,
        color,
        methodology,
      })
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 생성에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">새 프로젝트 등록</h1>
      <p className="text-sm text-slate-500 mb-6">
        기본 정보만 먼저 등록하고, 상세 범위/일정은 이후 프로젝트 화면에서 추가할 수 있습니다.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 text-rose-700 text-sm px-3.5 py-2.5 border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <label className={labelCls}>프로젝트명</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>목표</label>
          <textarea
            className={inputCls}
            rows={2}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>방법론</label>
          <div className="flex gap-2">
            {methodologies.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethodology(m.key)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
                  methodology === m.key
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>스폰서</label>
            <input className={inputCls} value={sponsor} onChange={(e) => setSponsor(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>PM(담당자)</label>
            <select className={inputCls} value={managerId} onChange={(e) => setManagerId(e.target.value)}>
              <option value="">선택 안 함</option>
              {masterData.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.title})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>소속 팀 (포트폴리오 조직 필터용)</label>
          <select className={inputCls} value={ownerTeamId} onChange={(e) => setOwnerTeamId(e.target.value)}>
            <option value="">선택 안 함</option>
            {masterData.teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>시작일</label>
            <input
              type="date"
              className={inputCls}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>종료(목표)일</label>
            <input
              type="date"
              className={inputCls}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>캘린더/간트에 표시할 색상</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-slate-500' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? '생성 중...' : '프로젝트 생성'}
          </button>
        </div>
      </form>
    </div>
  )
}
