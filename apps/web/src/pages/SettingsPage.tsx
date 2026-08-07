import { useState } from 'react'
import { GeneralTab } from './settings-tabs/GeneralTab'
import { PeopleTab } from './settings-tabs/PeopleTab'
import { MasterDataTab } from './settings-tabs/MasterDataTab'

type SettingsTab = 'general' | 'people' | 'masterData'

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'general', label: '일반' },
  { key: 'people', label: '담당자 · 팀 관리' },
  { key: 'masterData', label: '마스터 데이터' },
]

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">설정</h1>
        <p className="mt-1 text-sm text-slate-500">
          데이터 연결 상태, 담당자/팀 구성, 상태값 표시 이름을 관리합니다.
        </p>
      </div>

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

      {tab === 'general' && <GeneralTab />}
      {tab === 'people' && <PeopleTab />}
      {tab === 'masterData' && <MasterDataTab />}
    </div>
  )
}
