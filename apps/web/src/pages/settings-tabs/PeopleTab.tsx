import { useState } from 'react'
import { useMasterData } from '../../lib/MasterDataContext'
import type { Person, Team } from '../../masterData'
import { findTeam } from '../../masterData'
import { Modal } from '../../components/Modal'
import { TeamForm } from '../../components/TeamForm'
import { PersonForm } from '../../components/PersonForm'

function teamDepth(teams: Team[], team: Team): number {
  let depth = 0
  let current = team
  while (current.parentTeamId) {
    const parent = findTeam(teams, current.parentTeamId)
    if (!parent) break
    depth += 1
    current = parent
  }
  return depth
}

export function PeopleTab() {
  const { masterData, save } = useMasterData()
  const [addingTeam, setAddingTeam] = useState(false)
  const [addingPerson, setAddingPerson] = useState(false)

  const sortedTeams = [...masterData.teams].sort(
    (a, b) => teamDepth(masterData.teams, a) - teamDepth(masterData.teams, b) || a.name.localeCompare(b.name),
  )

  function addTeam(team: Team) {
    save({ ...masterData, teams: [...masterData.teams, team] })
    setAddingTeam(false)
  }

  function removeTeam(id: string) {
    const hasChildren = masterData.teams.some((t) => t.parentTeamId === id)
    const hasPeople = masterData.people.some((p) => p.teamId === id)
    if (hasChildren || hasPeople) {
      window.alert('하위 조직이나 소속 인원이 있는 팀은 삭제할 수 없습니다. 먼저 이동/삭제해주세요.')
      return
    }
    save({ ...masterData, teams: masterData.teams.filter((t) => t.id !== id) })
  }

  function addPerson(person: Person) {
    save({ ...masterData, people: [...masterData.people, person] })
    setAddingPerson(false)
  }

  function removePerson(id: string) {
    save({ ...masterData, people: masterData.people.filter((p) => p.id !== id) })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">조직/팀</h2>
          <button
            type="button"
            onClick={() => setAddingTeam(true)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
          >
            + 팀 추가
          </button>
        </div>
        {sortedTeams.length === 0 ? (
          <p className="text-sm text-slate-400">등록된 팀이 없습니다.</p>
        ) : (
          <ul className="space-y-1.5">
            {sortedTeams.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span style={{ paddingLeft: teamDepth(masterData.teams, t) * 16 }}>
                  {teamDepth(masterData.teams, t) > 0 && <span className="text-slate-300 mr-1">└</span>}
                  {t.name}
                  <span className="ml-2 text-xs text-slate-400">
                    {masterData.people.filter((p) => p.teamId === t.id).length}명
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeTeam(t.id)}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">담당자</h2>
          <button
            type="button"
            onClick={() => setAddingPerson(true)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
          >
            + 담당자 추가
          </button>
        </div>
        {masterData.people.length === 0 ? (
          <p className="text-sm text-slate-400">등록된 담당자가 없습니다.</p>
        ) : (
          <ul className="space-y-1.5">
            {masterData.people.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {findTeam(masterData.teams, p.teamId)?.name ?? '-'} · {p.title || '직급 미지정'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removePerson(p.id)}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {addingTeam && (
        <Modal title="팀 추가" onClose={() => setAddingTeam(false)}>
          <TeamForm teams={masterData.teams} onCancel={() => setAddingTeam(false)} onSubmit={addTeam} />
        </Modal>
      )}
      {addingPerson && (
        <Modal title="담당자 추가" onClose={() => setAddingPerson(false)}>
          <PersonForm teams={masterData.teams} onCancel={() => setAddingPerson(false)} onSubmit={addPerson} />
        </Modal>
      )}
    </div>
  )
}
