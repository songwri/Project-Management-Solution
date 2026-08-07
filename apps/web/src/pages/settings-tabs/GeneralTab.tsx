import type { ReactNode } from 'react'
import { API_BASE, IS_DEMO_MODE } from '../../lib/config'
import { useMasterData } from '../../lib/MasterDataContext'
import { DEFAULT_METHODOLOGIES } from '../../types'

const METHODOLOGY_GUIDE: Record<string, string> = {
  waterfall: '단계(요구분석→설계→개발→테스트→배포) 기준으로 일정을 관리합니다. 캘린더/간트로 시각화됩니다.',
  agile: '스프린트 단위로 진행하며 일정 탭에서 칸반 보드(To Do/Doing/Review/Done)로 관리합니다.',
  hybrid: '상위 단계는 Waterfall 마일스톤으로, 세부 작업은 스프린트/칸반으로 관리하는 2단 구조입니다.',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">{title}</h2>
      {children}
    </section>
  )
}

export function GeneralTab() {
  const { masterData } = useMasterData()
  const methodologies = masterData.methodologies.length > 0 ? masterData.methodologies : DEFAULT_METHODOLOGIES

  return (
    <div className="max-w-2xl space-y-6">
      <Section title="데이터 연결">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">모드</dt>
            <dd className="font-medium text-slate-800">
              {IS_DEMO_MODE ? '데모 모드 (브라우저 localStorage)' : '실전 모드 (GitHub 연동)'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">쓰기 API</dt>
            <dd className="font-medium text-slate-800">{API_BASE ?? '미설정 — 데모 모드로 동작'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">데이터 저장소</dt>
            <dd>
              <a
                href="https://github.com/songwri/project-management-solution/tree/main/data"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-800 hover:underline"
              >
                songwri/project-management-solution /data
              </a>
            </dd>
          </div>
        </dl>
        {IS_DEMO_MODE && (
          <p className="mt-4 rounded-lg bg-amber-50 text-amber-800 text-xs px-3 py-2.5">
            실전 배포 시 Cloudflare Worker API URL을 <code>VITE_API_BASE</code>로 지정하면 모든 저장이 GitHub 커밋으로
            전환됩니다. 자세한 절차는 저장소의 docs/DEPLOYMENT.md를 참고하세요.
          </p>
        )}
      </Section>

      <Section title="방법론 운영 기준">
        <ul className="space-y-3">
          {methodologies.map((m) => (
            <li key={m.key} className="text-sm">
              <span className="font-semibold text-slate-800">{m.label}</span>
              <p className="mt-0.5 text-slate-500">
                {METHODOLOGY_GUIDE[m.key] ?? '이 방법론은 캘린더/간트로 일정이 표시됩니다.'}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-400">
          표시 이름은 "마스터 데이터" 탭에서 변경할 수 있습니다. Agile/Hybrid는 칸반 보드가 함께 제공됩니다 — 이
          동작은 waterfall/agile/hybrid 키에 고정되어 있어, 새로 추가한 방법론은 이름을 바꿔 달 수는 있지만 별도의
          화면 동작은 갖지 않습니다.
        </p>
      </Section>
    </div>
  )
}
