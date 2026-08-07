import type { Methodology, Project, Portfolio } from '../types'
import { IS_DEMO_MODE } from './config'
import { localDemoClient } from './localDemoClient'
import { remoteClient } from './remoteClient'

export interface NewProjectInput {
  name: string
  color: string
  objective: string
  sponsor: string
  manager: string
  startDate: string
  endDate: string
  methodology: Methodology
}

export interface DataClient {
  readonly mode: 'demo' | 'remote'
  getPortfolio(): Promise<Portfolio>
  listProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | undefined>
  saveProject(project: Project): Promise<Project>
  createProject(input: NewProjectInput): Promise<Project>
  resetDemoData?(): Promise<void>
}

export const dataClient: DataClient = IS_DEMO_MODE ? localDemoClient : remoteClient
