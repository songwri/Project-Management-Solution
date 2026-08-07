import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dataClient } from './dataClient'
import type { MasterData } from '../masterData'

const EMPTY_MASTER_DATA: MasterData = {
  teams: [],
  people: [],
  statuses: [],
  methodologies: [],
  healthLevels: [],
  projectRoles: [],
  overtimeLogs: [],
}

interface MasterDataContextValue {
  masterData: MasterData
  loading: boolean
  refresh: () => Promise<void>
  save: (data: MasterData) => Promise<void>
}

const MasterDataContext = createContext<MasterDataContextValue | null>(null)

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [masterData, setMasterData] = useState<MasterData>(EMPTY_MASTER_DATA)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const data = await dataClient.getMasterData()
    setMasterData(data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function save(data: MasterData) {
    const saved = await dataClient.saveMasterData(data)
    setMasterData(saved)
  }

  return (
    <MasterDataContext.Provider value={{ masterData, loading, refresh, save }}>
      {children}
    </MasterDataContext.Provider>
  )
}

export function useMasterData(): MasterDataContextValue {
  const ctx = useContext(MasterDataContext)
  if (!ctx) throw new Error('useMasterData must be used within MasterDataProvider')
  return ctx
}
