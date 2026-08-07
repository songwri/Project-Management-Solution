# 데이터 모델

모든 데이터는 저장소의 `/data` 폴더 아래 JSON 파일로 저장됩니다. 스키마의
단일 소스는 `apps/web/src/types.ts`이며, 이 문서는 그 요약입니다.

```
data/
├── portfolio.json           # 포트폴리오 메타 + 소속 프로젝트 ID 목록
├── masterData.json          # 담당자/팀/상태값 표시 이름 (아래 참고)
└── projects/
    ├── proj-crm-revamp.json # 프로젝트 1건 = 파일 1개
    ├── proj-mobile-app.json
    └── ...
```

프로젝트 1개 = JSON 파일 1개로 나눈 이유:
- Worker가 한 번에 파일 하나만 커밋하므로 동시 편집 시 충돌 범위가 프로젝트
  단위로 좁아집니다 (다른 프로젝트를 동시에 수정해도 서로 충돌하지 않음).
- git diff/history에서 "어떤 프로젝트가 언제 바뀌었는지"가 파일 단위로
  바로 드러납니다.

## portfolio.json

```jsonc
{
  "name": "2026년 사업부 프로젝트 포트폴리오",
  "description": "...",
  "projectIds": ["proj-crm-revamp", "proj-mobile-app", ...]
}
```

## masterData.json

프로젝트 데이터와 분리된, 조직 전반에서 공유되는 마스터 데이터입니다.
설정 화면의 "담당자 · 팀 관리" / "마스터 데이터" 탭에서 편집합니다.

```jsonc
{
  "teams": [{ "id": "team-dev", "name": "개발본부" }, { "id": "team-dev-fe", "name": "프론트엔드팀", "parentTeamId": "team-dev" }],
  "people": [{ "id": "p-park-seoyeon", "name": "박서연", "teamId": "team-dev-be", "title": "책임" }],
  "statuses": [{ "key": "planning", "label": "기획" }, ...],
  "methodologies": [{ "key": "waterfall", "label": "Waterfall" }, ...],
  "healthLevels": [{ "key": "on_track", "label": "정상" }, ...],
  "projectRoles": [{ "key": "pm", "label": "PM" }, { "key": "member", "label": "멤버" }, ...],
  "overtimeLogs": [{ "id": "ot-1", "personId": "p-jung-haneul", "month": "2026-08", "hours": 26 }]
}
```

- `statuses`/`methodologies`/`healthLevels`/`projectRoles`는 **표시 이름을
  자유롭게 바꾸거나 새 항목을 추가/삭제**할 수 있는 마스터 데이터입니다
  (예: `waterfall` 값은 그대로 두고 라벨만 "흐름방식"으로 변경). `key`는
  프로젝트 JSON에 그대로 저장되는 값이라 바꾸면 기존 데이터와 어긋나니
  바꾸지 마세요 — 바꿀 수 있는 건 `label`뿐입니다. `agile`/`hybrid`(칸반
  활성화)와 `closed`(종료 처리)처럼 화면 동작에 연결된 키는 삭제가
  막혀 있습니다(라벨 변경은 가능).
- `overtimeLogs`는 담당자가 특정 월에 추가로 투입한 시간(야근)을 기록해
  가동률(person-month) 계산에 반영합니다 — `apps/web/src/lib/capacity.ts`.

## projects/*.json (Project)

| 필드 | 설명 |
|---|---|
| `id` | 파일명과 동일한 고유 ID (`proj-` 접두사 + slug) |
| `status` | 라이프사이클 단계 — masterData.json의 `statuses` 키 |
| `methodology` | 일정 탭의 렌더링 방식을 결정 — masterData.json의 `methodologies` 키 |
| `health` | PM의 리스크 판단(🟢/🟡/🔴) — masterData.json의 `healthLevels` 키 |
| `color` | 캘린더/간트에서 이 프로젝트를 나타내는 색상 (hex) |
| `ownerTeamId` | 프로젝트를 소유한 팀 (`masterData.json`의 `teams[].id`) — 대시보드 조직별 필터에 사용 |
| `assignments` | `{ personId, role }[]` — 담당자 배정. 같은 사람도 프로젝트마다 역할이 다를 수 있음 (한 프로젝트에서는 PM, 다른 프로젝트에서는 멤버) |
| `overview` | 목표, 스폰서(자유 텍스트), 기간, 예산(자유 텍스트), 배경 |
| `scope` | 포함 범위 / 제외 범위 / 계획된 산출물 목록 |
| `schedule` | `ScheduleTask[]` — 세부 일정 (작업/마일스톤), 캘린더·간트·칸반의 원천 데이터 |
| `sprints` | `Sprint[]` — Agile/Hybrid 프로젝트의 스프린트 목록 (선택) |
| `risks` | `Risk[]` — 리스크 탭에 표시, 대시보드 알림 배지 집계에도 사용 |
| `meetingMinutes` | `MeetingMinute[]` — 회의록, 액션 아이템 포함 |
| `deliverables` | `Deliverable[]` — 등록된 산출물, 종료 처리 가능 여부를 결정 |
| `progressLog` | 시점별 진행률 스냅샷 (선택적 기록용) |
| `budgetTracking` | `{ planned, spent }` (KRW, 선택) — 대시보드 상세 보기의 예산 소진율 컬럼 |
| `updatedAt` | Worker가 저장 시마다 자동 갱신 |

### ScheduleTask

```jsonc
{
  "id": "t4",
  "name": "개발 - 파이프라인 모듈",
  "start": "2026-07-06",
  "end": "2026-08-21",
  "progress": 65,
  "category": "task",       // "task" | "milestone" | "meeting"
  "assignee": "p-choi-mina", // masterData.json people[].id (자유 텍스트 아님)
  "dependsOn": ["t3"],       // 간트 차트의 의존관계 화살표로 표시됨
  "kanbanStatus": "doing",  // Agile/Hybrid만: "todo"|"doing"|"review"|"done"
  "storyPoints": 8,          // Agile/Hybrid만
  "sprintId": "sprint-1"     // Agile/Hybrid만
}
```

포트폴리오 대시보드의 통합 캘린더/간트는 모든 프로젝트의 `schedule`을
`projectId`로 색상 구분해 한 화면에 겹쳐 보여주는 방식으로 동작합니다
(`apps/web/src/lib/calendarEvents.ts`).

### 방법론(methodology)별 일정 탭 동작

- **waterfall**: 캘린더/간트만 제공.
- **agile**: 캘린더/간트 + 칸반 보드(`kanbanStatus` 기준 To Do/Doing/Review/Done).
- **hybrid**: 세 가지 모두 제공 — 상위 단계는 마일스톤으로, 세부 작업은
  `sprintId`/`kanbanStatus`를 채워 스프린트 단위로 관리하는 2단 구조를
  의도합니다.

### 가동률(Man/Month) 계산

`apps/web/src/lib/capacity.ts`가 담당자별 월간 가동률을 계산합니다:

- 하루 8시간을 표준으로 두고, 그 사람이 `assignee`로 지정된 모든 작업의
  기간이 해당 월과 겹치는 영업일(월~금) 수를 합산합니다 (여러 프로젝트에
  겹쳐 배정되어 있으면 자동으로 100%를 넘습니다).
- 여기에 `masterData.json`의 `overtimeLogs`에 기록된 그 달의 야근 시간을
  더해 최종 가동률(`totalHours / standardHours`)을 냅니다.
- 리소스 페이지(`/resources`)는 이 값을 기준으로 정상(<85%) / 바쁨
  (85~100%) / 과부하(>100%)를 표시합니다.

### Risk

```jsonc
{
  "id": "risk-1",
  "description": "레거시 데이터 마이그레이션 시 정합성 이슈 발생 가능성",
  "severity": "medium",   // "low" | "medium" | "high"
  "owner": "최민아",
  "resolved": false,
  "createdAt": "2026-07-20"
}
```

해결되지 않은(`resolved: false`) 리스크 개수는 프로젝트 카드/테이블,
프로젝트 상세 탭 배지, 헤더 알림 배지에 모두 집계되어 표시됩니다
(`openRiskCount()`, `apps/web/src/types.ts`).

### 프로젝트 종료(closeout) 규칙

`deliverables` 배열에 `status`가 `submitted` 또는 `approved`인 항목이
1건 이상 있어야 상태를 `closed`로 변경할 수 있습니다
(`canCloseProject()`, `apps/web/src/types.ts`). UI와 Worker 양쪽에서
검증하는 것을 권장합니다 — 현재는 UI에서만 강제하고 있으니, 운영 단계에서
동시 편집을 신뢰할 수 없다면 Worker의 `PUT /api/projects/:id`에도 동일한
검증을 추가하세요.

## 큰 첨부파일은 어떻게 하나요?

산출물(`Deliverable.link`)은 URL만 저장합니다. 수 MB를 넘는 파일은 git
저장소에 직접 커밋하지 말고, 회사 SharePoint/Teams 파일 저장소에 올린 뒤
공유 링크를 등록하는 것을 권장합니다. 수 MB 이하의 문서(보고서 PDF 등)는
`deliverables/<projectId>/` 경로에 직접 커밋해도 무방합니다 — 예시
데이터의 링크가 이 패턴을 보여줍니다.
