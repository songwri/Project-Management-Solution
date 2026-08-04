import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IS_DEMO_MODE } from '../lib/config'
import { AccessCodeButton } from './AccessCodeButton'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-semibold">
              PM
            </span>
            <span className="font-semibold text-slate-900 hidden sm:inline">
              프로젝트 관리 포트폴리오
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {IS_DEMO_MODE ? (
              <span className="text-xs rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 font-medium">
                데모 모드 · 브라우저에만 저장됨
              </span>
            ) : (
              <AccessCodeButton />
            )}
            <Link
              to="/projects/new"
              className="text-sm font-medium rounded-lg bg-slate-900 text-white px-3.5 py-2 hover:bg-slate-800 transition-colors"
            >
              + 새 프로젝트
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">{children}</main>

      <footer className="border-t border-slate-200 py-4">
        <p className="mx-auto max-w-7xl px-4 sm:px-6 text-xs text-slate-400">
          데이터는 GitHub 저장소에 버전 관리되어 저장됩니다.
        </p>
      </footer>
    </div>
  )
}
