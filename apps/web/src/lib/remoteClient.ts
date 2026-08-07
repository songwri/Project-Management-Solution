import type { Project, Portfolio } from '../types'
import type { MasterData } from '../masterData'
import type { DataClient, NewProjectInput } from './dataClient'
import { API_BASE } from './config'
import { getAccessToken } from './authToken'

export class ApiAuthError extends Error {
  constructor() {
    super('접근 코드가 유효하지 않습니다. 다시 로그인해 주세요.')
    this.name = 'ApiAuthError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (res.status === 401 || res.status === 403) throw new ApiAuthError()
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API 요청 실패 (${res.status}): ${body || res.statusText}`)
  }
  return res.json() as Promise<T>
}

// Talks to the Cloudflare Worker (apps/worker), which commits every write
// to the GitHub repo's /data folder via the Contents API. See
// docs/DEPLOYMENT.md for how to deploy and configure VITE_API_BASE.
export const remoteClient: DataClient = {
  mode: 'remote',

  getPortfolio() {
    return request<Portfolio>('/api/portfolio')
  },

  async listProjects() {
    const portfolio = await request<Portfolio>('/api/portfolio')
    const projects = await Promise.all(
      portfolio.projectIds.map((id) => request<Project>(`/api/projects/${id}`)),
    )
    return projects
  },

  getProject(id) {
    return request<Project>(`/api/projects/${id}`)
  },

  saveProject(project) {
    return request<Project>(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    })
  },

  createProject(input: NewProjectInput) {
    return request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  getMasterData() {
    return request<MasterData>('/api/master-data')
  },

  saveMasterData(data) {
    return request<MasterData>('/api/master-data', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}
