export interface Env {
  GITHUB_OWNER: string
  GITHUB_REPO: string
  GITHUB_BRANCH: string
  DATA_PATH_PREFIX: string
  ALLOWED_ORIGIN: string
  GITHUB_TOKEN: string
  ACCESS_TOKEN: string
}

const GITHUB_API = 'https://api.github.com'

function apiHeaders(env: Env): HeadersInit {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'pm-solution-worker',
  }
}

// base64 helpers that handle UTF-8 (Korean text) correctly, unlike the
// deprecated btoa/atob which only support Latin1.
function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export class GitHubApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export class NotFoundError extends Error {}

function contentsUrl(env: Env, path: string): string {
  return `${GITHUB_API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`
}

/** Reads and JSON-parses a file from the repo's /data folder. */
export async function readJsonFile<T>(env: Env, relativePath: string): Promise<T> {
  const path = `${env.DATA_PATH_PREFIX}/${relativePath}`
  const res = await fetch(`${contentsUrl(env, path)}?ref=${env.GITHUB_BRANCH}`, {
    headers: apiHeaders(env),
  })
  if (res.status === 404) throw new NotFoundError(relativePath)
  if (!res.ok) throw new GitHubApiError(res.status, await res.text())
  const body = (await res.json()) as { content: string }
  return JSON.parse(decodeBase64(body.content)) as T
}

/**
 * Writes (creates or updates) a JSON file in the repo's /data folder as a
 * single commit. Retries once on a 409 (sha conflict from a concurrent
 * write) by re-fetching the current sha.
 */
export async function writeJsonFile(
  env: Env,
  relativePath: string,
  data: unknown,
  commitMessage: string,
): Promise<void> {
  const path = `${env.DATA_PATH_PREFIX}/${relativePath}`
  const content = encodeBase64(JSON.stringify(data, null, 2) + '\n')

  for (let attempt = 0; attempt < 2; attempt++) {
    let sha: string | undefined
    const existing = await fetch(`${contentsUrl(env, path)}?ref=${env.GITHUB_BRANCH}`, {
      headers: apiHeaders(env),
    })
    if (existing.ok) {
      sha = ((await existing.json()) as { sha: string }).sha
    } else if (existing.status !== 404) {
      throw new GitHubApiError(existing.status, await existing.text())
    }

    const res = await fetch(contentsUrl(env, path), {
      method: 'PUT',
      headers: { ...apiHeaders(env), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: commitMessage,
        content,
        branch: env.GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    })
    if (res.ok) return
    if (res.status === 409 && attempt === 0) continue // sha conflict, retry
    throw new GitHubApiError(res.status, await res.text())
  }
}
