import { type Env, readJsonFile, writeJsonFile, NotFoundError, GitHubApiError } from './github'

interface Portfolio {
  name: string
  description: string
  projectIds: string[]
}

interface NewProjectInput {
  name: string
  color: string
  objective: string
  sponsor: string
  managerId: string
  startDate: string
  endDate: string
  methodology: 'waterfall' | 'agile' | 'hybrid'
  ownerTeamId?: string
}

function corsHeaders(env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }
}

function json(env: Env, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  })
}

function errorResponse(env: Env, status: number, message: string): Response {
  return json(env, { error: message }, status)
}

function isAuthorized(request: Request, env: Env): boolean {
  const header = request.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  return Boolean(env.ACCESS_TOKEN) && token === env.ACCESS_TOKEN
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `proj-${base || 'new'}-${Date.now().toString(36)}`
}

async function handleGetPortfolio(env: Env): Promise<Response> {
  const portfolio = await readJsonFile<Portfolio>(env, 'portfolio.json')
  return json(env, portfolio)
}

async function handleGetMasterData(env: Env): Promise<Response> {
  const masterData = await readJsonFile(env, 'masterData.json')
  return json(env, masterData)
}

async function handlePutMasterData(env: Env, request: Request): Promise<Response> {
  const body = await request.json()
  await writeJsonFile(env, 'masterData.json', body, 'chore(data): update master data')
  return json(env, body)
}

async function handleGetProject(env: Env, id: string): Promise<Response> {
  const project = await readJsonFile(env, `projects/${id}.json`)
  return json(env, project)
}

async function handlePutProject(env: Env, id: string, request: Request): Promise<Response> {
  const body = (await request.json()) as Record<string, unknown>
  if (body.id !== id) return errorResponse(env, 400, 'body.id가 URL의 프로젝트 ID와 일치하지 않습니다.')
  const project = { ...body, updatedAt: new Date().toISOString() }
  await writeJsonFile(env, `projects/${id}.json`, project, `chore(data): update project ${id}`)
  return json(env, project)
}

async function handleCreateProject(env: Env, request: Request): Promise<Response> {
  const input = (await request.json()) as NewProjectInput
  if (!input.name) return errorResponse(env, 400, 'name은 필수입니다.')

  const id = slugify(input.name)
  const now = new Date().toISOString()
  const project = {
    id,
    name: input.name,
    status: 'planning',
    methodology: input.methodology,
    health: 'on_track',
    color: input.color,
    ownerTeamId: input.ownerTeamId,
    assignments: input.managerId ? [{ personId: input.managerId, role: 'pm' }] : [],
    overview: {
      objective: input.objective,
      sponsor: input.sponsor,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    scope: { inScope: [], outOfScope: [], plannedDeliverables: [] },
    schedule: [],
    sprints: [],
    risks: [],
    meetingMinutes: [],
    deliverables: [],
    progressLog: [],
    updatedAt: now,
  }

  await writeJsonFile(env, `projects/${id}.json`, project, `chore(data): create project ${id}`)

  const portfolio = await readJsonFile<Portfolio>(env, 'portfolio.json')
  portfolio.projectIds.push(id)
  await writeJsonFile(env, 'portfolio.json', portfolio, `chore(data): register project ${id} in portfolio`)

  return json(env, project, 201)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) })
    }

    if (!isAuthorized(request, env)) {
      return errorResponse(env, 401, '인증되지 않았습니다. 접속 코드를 확인해 주세요.')
    }

    const url = new URL(request.url)
    const parts = url.pathname.split('/').filter(Boolean) // ['api', 'projects', ':id']

    try {
      if (parts[0] === 'api' && parts[1] === 'portfolio' && request.method === 'GET') {
        return await handleGetPortfolio(env)
      }
      if (parts[0] === 'api' && parts[1] === 'master-data' && request.method === 'GET') {
        return await handleGetMasterData(env)
      }
      if (parts[0] === 'api' && parts[1] === 'master-data' && request.method === 'PUT') {
        return await handlePutMasterData(env, request)
      }
      if (parts[0] === 'api' && parts[1] === 'projects' && parts[2] && request.method === 'GET') {
        return await handleGetProject(env, parts[2])
      }
      if (parts[0] === 'api' && parts[1] === 'projects' && parts[2] && request.method === 'PUT') {
        return await handlePutProject(env, parts[2], request)
      }
      if (parts[0] === 'api' && parts[1] === 'projects' && !parts[2] && request.method === 'POST') {
        return await handleCreateProject(env, request)
      }
      return errorResponse(env, 404, 'Not found')
    } catch (e) {
      if (e instanceof NotFoundError) return errorResponse(env, 404, `데이터를 찾을 수 없습니다: ${e.message}`)
      if (e instanceof GitHubApiError) return errorResponse(env, 502, `GitHub API 오류: ${e.message}`)
      return errorResponse(env, 500, e instanceof Error ? e.message : 'Unknown error')
    }
  },
} satisfies ExportedHandler<Env>
