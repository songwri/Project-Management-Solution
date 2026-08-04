# 배포 가이드

이 프로젝트는 두 부분으로 배포됩니다.

1. **웹 앱 (`apps/web`)** — 정적 사이트, **GitHub Pages**에 배포
2. **쓰기 API (`apps/worker`)** — **Cloudflare Workers**(무료 티어)에 배포,
   폼 입력을 GitHub 커밋으로 변환하는 유일한 역할

둘 다 없이 `apps/web`만 로컬에서 띄우면 "데모 모드"로 동작해 브라우저에만
저장되는 상태로 전체 기능을 체험할 수 있습니다. 실제 팀이 함께 쓰려면
아래 순서대로 두 부분을 모두 배포하세요.

## 1단계 — GitHub Pages로 웹 앱 배포

1. 저장소 **Settings → Pages → Build and deployment → Source**를
   **GitHub Actions**로 설정합니다.
2. `main` 브랜치에 머지하면 `.github/workflows/deploy.yml`이 자동으로
   `apps/web`을 빌드하고 Pages에 배포합니다.
3. 배포 URL은 `https://<organization>.github.io/<repo>/` 형태입니다.
   저장소 이름이 다르면 `deploy.yml`의 `VITE_BASE_PATH` 값을 저장소 이름에
   맞게 수정하세요.

이 시점에서는 아직 Worker가 없으므로 사이트는 데모 모드로 동작합니다
(우측 상단에 "데모 모드" 배지가 표시됨).

## 2단계 — Cloudflare Worker 배포 (쓰기 API)

`apps/worker/README.md`에 상세 절차가 있습니다. 요약:

1. GitHub에서 이 저장소 전용 **fine-grained personal access token**을
   발급합니다. 권한은 **Contents: Read and write** 하나만 부여하세요.
2. Cloudflare 계정으로 `npx wrangler login`.
3. 시크릿 등록:
   ```
   cd apps/worker
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put ACCESS_TOKEN
   ```
4. `npm run deploy` → `https://pm-solution-api.<subdomain>.workers.dev` 형태의
   URL이 발급됩니다.

## 3단계 — 웹 앱이 Worker를 바라보도록 연결

1. 저장소 **Settings → Secrets and variables → Actions → Variables**에서
   `PM_API_BASE` 변수를 2단계에서 받은 Worker URL로 추가합니다.
2. `deploy.yml`을 다시 실행(재배포)하면 빌드 시 `VITE_API_BASE`로 주입되어
   데모 모드가 해제되고, 모든 저장이 실제 GitHub 커밋으로 이어집니다.
3. 팀원들에게 Worker의 `ACCESS_TOKEN`으로 설정한 값을 "접속 코드"로
   공유하세요. 사이트 우측 상단 **접속 코드** 버튼에서 입력하면 저장이
   가능해집니다.

## 아키텍처가 이렇게 된 이유

- **왜 GitHub Pages만으로는 안 되나요?** Pages는 정적 파일만 서빙합니다.
  폼 제출 시 GitHub API 토큰으로 커밋하는 동작은 서버 쪽 코드가 있어야
  하는데, 그 토큰을 브라우저(정적 사이트)에 두면 전 직원이 저장소 쓰기
  권한을 그대로 갖게 되어 위험합니다. Worker가 토큰을 서버 쪽 비밀로
  들고 있는 유일한 이유입니다.
- **왜 Cloudflare Workers인가요?** 사내에서 새 SaaS 도입이 어렵다는 제약
  조건 아래, 무료 티어로 충분하고(10~30인 규모), 설정이 몇 줄짜리
  `wrangler.toml`로 끝나며, GitHub Actions/Pages와 마찬가지로 코드로
  관리되는 인프라라 별도 콘솔 클릭 없이 재현 가능합니다. Vercel/Netlify
  Functions로 대체해도 동일한 역할을 하지만, Cloudflare가 무료 티어
  요청 한도가 가장 넉넉합니다.
- **왜 별도 데이터베이스를 쓰지 않나요?** 5~15개 프로젝트, 10~30명 규모에서는
  RDB/NoSQL이 주는 이점(복잡한 쿼리, 대용량 동시 쓰기)이 거의 필요 없고,
  대신 GitHub 저장소를 그대로 쓰면 버전 관리(누가 언제 무엇을 바꿨는지
  100% 추적), 백업(저장소 자체가 백업), 접근 제어(저장소 권한 재사용)를
  공짜로 얻습니다. 이후 규모가 커지면(수십~수백 프로젝트, 초 단위 동시
  편집 등) Postgres 기반 백엔드로 이전하는 것을 권장하며, Worker가 이미
  API 경계 역할을 하고 있으므로 프런트엔드 코드는 거의 변경 없이
  마이그레이션할 수 있습니다.

## 로컬 개발

```
# 웹 앱만 (데모 모드, 백엔드 불필요)
cd apps/web
npm install
npm run seed:sync
npm run dev

# Worker까지 함께 (실 GitHub 연동 테스트)
cd apps/worker
npm install
cp .dev.vars.example .dev.vars   # 값 채우기
npm run dev
# 다른 터미널에서: apps/web/.env.local 에 VITE_API_BASE=http://127.0.0.1:8787 추가 후 npm run dev
```
