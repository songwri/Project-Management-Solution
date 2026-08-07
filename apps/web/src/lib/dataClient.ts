import type { Methodology, Project, Portfolio } from '../types'
import type { MasterData } from '../masterData'
import { IS_DEMO_MODE } from './config'
import { localDemoClient } from './localDemoClient'
import { remoteClient } from './remoteClient'

export interface NewProjectInput {
  name: string
  color: string
  objective: string
  sponsor: string
  managerId: string // Person.id, becomes the PM assignment
  startDate: string
  endDate: string
  methodology: Methodology
  ownerTeamId?: string
}

export interface DataClient {
  readonly mode: 'demo' | 'remote'
  getPortfolio(): Promise<Portfolio>
  listProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | undefined>
  saveProject(project: Project): Promise<Project>
  createProject(input: NewProjectInput): Promise<Project>
  getMasterData(): Promise<MasterData>
  saveMasterData(data: MasterData): Promise<MasterData>
  resetDemoData?(): Promise<void>
}

export const dataClient: DataClient = IS_DEMO_MODE ? localDemoClient : remoteClient
