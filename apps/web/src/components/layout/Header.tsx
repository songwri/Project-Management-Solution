import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { dataClient } from '../../lib/dataClient'
import { openRiskCount } from '../../types'
import { IS_DEMO_MODE } from '../../lib/config'
import { AccessCodeButton } from '../AccessCodeButton'

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [riskCount, setRiskCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    dataClient.listProjects().then((projects) => {
      setRiskCount(projects.reduce((sum, p) => sum + openRiskCount(p), 0))
    })
  }, [])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
  }

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center gap-4 px-4 sm:px-5">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 shrink-0"
        aria-label="사이드바 접기/펼치기"
      >
        ☰
      </button>

      <Link to="/" className="flex items-center gap-2 shrink-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-semibold">
          PM
        </span>
        <span className="font-semibold text-slate-900 hidden lg:inline">포트폴리오 매니지먼트</span>
      </Link>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="프로젝트 검색..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm focus:border-slate-500 focus:bg-white focus:outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {IS_DEMO_MODE ? (
          <span className="text-xs rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 font-medium hidden sm:inline">
            데모 모드
          </span>
        ) : (
          <AccessCodeButton />
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="알림"
          >
            🔔
            {riskCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                {riskCount > 9 ? '9+' : riskCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg z-30 text-sm">
              {riskCount > 0 ? (
                <p className="text-slate-700">
                  전체 포트폴리오에 해결되지 않은 리스크가 <strong>{riskCount}건</strong> 있습니다.
                </p>
              ) : (
                <p className="text-slate-400">열려있는 리스크가 없습니다.</p>
              )}
            </div>
          )}
        </div>

        <Link
          to="/projects/new"
          className="text-sm font-medium rounded-lg bg-slate-900 text-white px-3.5 py-2 hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          + 새 프로젝트
        </Link>
      </div>
    </header>
  )
}
