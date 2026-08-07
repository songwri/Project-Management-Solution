import { useMasterData } from '../../lib/MasterDataContext'
import { TaxonomyEditor } from '../../components/TaxonomyEditor'
import { PM_ROLE_KEY } from '../../masterData'
import { DEFAULT_HEALTH_LEVELS, DEFAULT_METHODOLOGIES, DEFAULT_STATUSES, RESERVED_METHODOLOGY } from '../../types'

export function MasterDataTab() {
  const { masterData, save } = useMasterData()
  const statuses = masterData.statuses.length > 0 ? masterData.statuses : DEFAULT_STATUSES
  const methodologies = masterData.methodologies.length > 0 ? masterData.methodologies : DEFAULT_METHODOLOGIES
  const healthLevels = masterData.healthLevels.length > 0 ? masterData.healthLevels : DEFAULT_HEALTH_LEVELS

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        아래 항목들의 표시 이름(라벨)을 자유롭게 바꾸거나 새 항목을 추가/삭제할 수 있습니다. 예:
        "waterfall"이라는 값은 그대로 두고 화면에 보이는 이름만 "흐름방식"으로 바꿀 수 있습니다. 화면 동작에
        연결된 값(잠금 표시)은 이름만 바꿀 수 있고 삭제는 막혀 있습니다.
      </p>

      <TaxonomyEditor
        title="프로젝트 상태"
        description="프로젝트 라이프사이클 단계. '완료'는 산출물 등록 후 종료 처리에 쓰입니다."
        options={statuses}
        onChange={(next) => save({ ...masterData, statuses: next })}
        reservedKeys={['closed']}
      />
      <TaxonomyEditor
        title="방법론"
        description="Agile/Hybrid로 지정된 값은 일정 탭에 칸반 보드를 추가로 표시합니다."
        options={methodologies}
        onChange={(next) => save({ ...masterData, methodologies: next })}
        reservedKeys={[RESERVED_METHODOLOGY.AGILE, RESERVED_METHODOLOGY.HYBRID]}
      />
      <TaxonomyEditor
        title="건강도"
        description="프로젝트 카드/테이블에 🟢🟡🔴 점으로 표시됩니다."
        options={healthLevels}
        onChange={(next) => save({ ...masterData, healthLevels: next })}
      />
      <TaxonomyEditor
        title="프로젝트 역할"
        description="담당자를 프로젝트에 배정할 때 선택하는 역할 목록입니다."
        options={masterData.projectRoles}
        onChange={(next) => save({ ...masterData, projectRoles: next })}
        reservedKeys={[PM_ROLE_KEY]}
      />
    </div>
  )
}
