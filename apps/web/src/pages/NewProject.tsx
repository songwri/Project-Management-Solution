import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataClient } from '../lib/dataClient'

const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#db2777']

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function NewProject() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [sponsor, setSponsor] = useState('')
  const [manager, setManager] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [color, setColor] = useState(COLORS[0])
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
        manager,
        startDate,
        endDate,
        color,
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
