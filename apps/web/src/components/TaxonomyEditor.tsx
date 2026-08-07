import { useState, type FormEvent } from 'react'
import type { MasterOption } from '../masterData'

function slugify(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return base || `option-${Date.now().toString(36)}`
}

export function TaxonomyEditor({
  title,
  description,
  options,
  onChange,
  reservedKeys = [],
}: {
  title: string
  description?: string
  options: MasterOption[]
  onChange: (options: MasterOption[]) => void
  reservedKeys?: string[]
}) {
  const [newLabel, setNewLabel] = useState('')

  function renameOption(key: string, label: string) {
    onChange(options.map((o) => (o.key === key ? { ...o, label } : o)))
  }

  function removeOption(key: string) {
    onChange(options.filter((o) => o.key !== key))
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newLabel.trim()) return
    let key = slugify(newLabel)
    while (options.some((o) => o.key === key)) key = `${key}-2`
    onChange([...options, { key, label: newLabel.trim() }])
    setNewLabel('')
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
      <ul className="mt-4 space-y-2">
        {options.map((o) => {
          const reserved = reservedKeys.includes(o.key)
          return (
            <li key={o.key} className="flex items-center gap-2">
              <input
                value={o.label}
                onChange={(e) => renameOption(o.key, e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
              />
              <code className="text-[11px] text-slate-400 w-28 truncate" title={o.key}>
                {o.key}
              </code>
              <button
                type="button"
                onClick={() => removeOption(o.key)}
                disabled={reserved}
                title={reserved ? '이 값은 화면 동작에 사용되어 삭제할 수 없습니다 (이름만 변경 가능)' : undefined}
                className="text-xs text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                삭제
              </button>
            </li>
          )
        })}
      </ul>
      <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="새 항목 이름"
          className="flex-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
        >
          + 추가
        </button>
      </form>
    </section>
  )
}
