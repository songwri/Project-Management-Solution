import type { Project, Portfolio } from '../types'
import type { DataClient, NewProjectInput } from './dataClient'

// Local demo/dev backend: seeds itself from the bundled /data/*.json files
// (synced from the repo-root /data via `npm run seed:sync`) and persists
// any edits to localStorage only. Nothing here ever leaves the browser.
// This lets anyone explore the full app with zero backend setup.

const STORAGE_KEY = 'pm-solution-demo-store-v1'

interface DemoStore {
  portfolio: Portfolio
  projects: Record<string, Project>
}

async function fetchSeed(): Promise<DemoStore> {
  const base = import.meta.env.BASE_URL
  const portfolio: Portfolio = await fetch(`${base}data/portfolio.json`).then((r) => r.json())
  const entries = await Promise.all(
    portfolio.projectIds.map(async (id) => {
      const project: Project = await fetch(`${base}data/projects/${id}.json`).then((r) => r.json())
      return [id, project] as const
    }),
  )
  return { portfolio, projects: Object.fromEntries(entries) }
}

function readStore(): DemoStore | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as DemoStore) : null
}

function writeStore(store: DemoStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

let inflight: Promise<DemoStore> | null = null

async function getStore(): Promise<DemoStore> {
  const cached = readStore()
  if (cached) return cached
  if (!inflight) {
    inflight = fetchSeed().then((store) => {
      writeStore(store)
      return store
    })
  }
  return inflight
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `proj-${base || 'new'}-${Date.now().toString(36)}`
}

export const localDemoClient: DataClient = {
  mode: 'demo',

  async getPortfolio() {
    const store = await getStore()
    return store.portfolio
  },

  async listProjects() {
    const store = await getStore()
    return store.portfolio.projectIds
      .map((id) => store.projects[id])
      .filter((p): p is Project => Boolean(p))
  },

  async getProject(id) {
    const store = await getStore()
    return store.projects[id]
  },

  async saveProject(project) {
    const store = await getStore()
    const updated: Project = { ...project, updatedAt: new Date().toISOString() }
    store.projects[project.id] = updated
    writeStore(store)
    return updated
  },

  async createProject(input: NewProjectInput) {
    const store = await getStore()
    const id = slugify(input.name)
    const project: Project = {
      id,
      name: input.name,
      status: 'planning',
      color: input.color,
      overview: {
        objective: input.objective,
        sponsor: input.sponsor,
        manager: input.manager,
        members: [],
        startDate: input.startDate,
        endDate: input.endDate,
      },
      scope: { inScope: [], outOfScope: [], plannedDeliverables: [] },
      schedule: [],
      meetingMinutes: [],
      deliverables: [],
      progressLog: [],
      updatedAt: new Date().toISOString(),
    }
    store.projects[id] = project
    store.portfolio.projectIds.push(id)
    writeStore(store)
    return project
  },

  async resetDemoData() {
    localStorage.removeItem(STORAGE_KEY)
    inflight = null
    await getStore()
  },
}
