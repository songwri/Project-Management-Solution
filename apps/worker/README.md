# pm-solution-api (Cloudflare Worker)

Thin write API that lets the web app (non-technical users, filling in forms)
save data by committing JSON files to this repo's `/data` folder through the
GitHub Contents API. GitHub stays the single source of truth and every save
is a normal, auditable git commit.

```
Browser (web app) --HTTPS--> Cloudflare Worker --GitHub REST API--> repo /data/*.json
```

Why a Worker and not GitHub Pages alone: GitHub Pages only serves static
files, it cannot hold a secret and make authenticated write calls to GitHub
on a form submit. The Worker is the one piece of infrastructure outside
GitHub — Cloudflare's free tier is enough for a 10–30 person team.

## Endpoints

All endpoints require `Authorization: Bearer <ACCESS_TOKEN>`.

| Method | Path                  | Description                              |
|--------|-----------------------|-------------------------------------------|
| GET    | `/api/portfolio`      | Returns `data/portfolio.json`             |
| GET    | `/api/projects/:id`   | Returns `data/projects/:id.json`          |
| PUT    | `/api/projects/:id`   | Upserts a project (full object body)      |
| POST   | `/api/projects`       | Creates a project, registers it in the portfolio |
| GET    | `/api/master-data`    | Returns `data/masterData.json` (teams, people, taxonomy labels) |
| PUT    | `/api/master-data`    | Replaces `data/masterData.json` (full object body) |

## One-time setup

1. Create a GitHub **fine-grained personal access token** (or a GitHub App
   installation token) scoped only to this repository with
   **Contents: Read and write** permission. Nothing else is needed.
2. Install [wrangler](https://developers.cloudflare.com/workers/wrangler/)
   and log in: `npx wrangler login`.
3. Edit `wrangler.toml` if your GitHub owner/repo/branch differ from the
   defaults, or if the deployed web app's origin differs from
   `ALLOWED_ORIGIN`.
4. Set the two secrets (never stored in the repo):
   ```
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put ACCESS_TOKEN   # any string your team shares to unlock write access
   ```
5. Deploy:
   ```
   npm install
   npm run deploy
   ```
6. Copy the deployed `*.workers.dev` URL into the web app's
   `VITE_API_BASE` build variable (see `apps/web` and the GitHub Actions
   workflow) and redeploy the frontend.

## Local development

```
cp .dev.vars.example .dev.vars   # fill in GITHUB_TOKEN / ACCESS_TOKEN
npm run dev
```

## Upgrade path: real auth

`ACCESS_TOKEN` is a single shared secret, intentionally simple for a small
internal tool. If this needs proper per-user auth later, replace
`isAuthorized()` in `src/index.ts` with Microsoft Entra ID (Azure AD) token
validation — the company already runs Microsoft 365 / Teams, so users would
sign in with the account they already have, no new IdP to stand up.
