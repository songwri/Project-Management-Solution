import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { dataClient } from '../lib/dataClient'
import type { Project, ScheduleTask } from '../types'

interface AssigneeTask {
  project: Project
  task: ScheduleTask
}

interface AssigneeSummary {
  name: string
  tasks: AssigneeTask[]
  projectCount: number
  openTaskCount: number
  avgProgress: number
}

function buildWorkload(projects: Project[]): AssigneeSummary[] {
  const byAssignee = new Map<string, AssigneeTask[]>()
  for (const project of projects) {
    for (const task of project.schedule) {
      if (!task.assignee) continue
      const list = byAssignee.get(task.assignee) ?? []
      list.push({ project, task })
      byAssignee.set(task.assignee, list)
    }
  }
  return [...byAssignee.entries()]
    .map(([name, tasks]) => {
      const projectIds = new Set(tasks.map((t) => t.project.id))
      const openTasks = tasks.filter((t) => t.task.progress < 100)
      const avgProgress = Math.round(tasks.reduce((s, t) => s + t.task.progress, 0) / tasks.length)
      return {
        name,
        tasks,
        projectCount: projectIds.size,
        openTaskCount: openTasks.length,
        avgProgress,
      }
    })
    .sort((a, b) => b.openTaskCount - a.openTaskCount)
}

function workloadColor(openTaskCount: number): string {
  if (openTaskCount >= 4) return 'bg-rose-500'
  if (openTaskCount >= 2) return 'bg-amber-500'
  return 'bg-emerald-500'
}

export function ResourcesPage() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    dataClient.listProjects().then(setProjects)
  }, [])

  const workload = useMemo(() => (projects ? buildWorkload(projects) : []), [projects])

  if (!projects) return <p className="text-slate-400 text-sm">불러오는 중...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">리소스 현황</h1>
        <p className="mt-1 text-sm text-slate-500">
          담당자별 참여 프로젝트와 진행 중인 작업 부하를 확인하세요. 행을 클릭하면 상세 작업 목록이 펼쳐집니다.
        </p>
      </div>

      {workload.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          담당자가 지정된 일정이 없습니다.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">담당자</th>
                <th className="text-left font-medium px-4 py-2.5">참여 프로젝트</th>
                <th className="text-left font-medium px-4 py-2.5">진행중 작업</th>
                <th className="text-left font-medium px-4 py-2.5">워크로드</th>
                <th className="text-left font-medium px-4 py-2.5">평균 진행률</th>
              </tr>
            </thead>
            <tbody>
              {workload.map((w) => (
                <Fragment key={w.name}>
                  <tr
                    onClick={() => setExpanded(expanded === w.name ? null : w.name)}
                    className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-800">{w.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{w.projectCount}개</td>
                    <td className="px-4 py-2.5 text-slate-500">{w.openTaskCount}건</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${workloadColor(w.openTaskCount)}`} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{w.avgProgress}%</td>
                  </tr>
                  {expanded === w.name && (
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <td colSpan={5} className="px-4 py-3">
                        <ul className="space-y-1.5">
                          {w.tasks.map(({ project, task }) => (
                            <li key={`${project.id}-${task.id}`} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                                <Link to={`/projects/${project.id}`} className="font-medium text-slate-700 hover:underline truncate">
                                  {project.name}
                                </Link>
                                <span className="text-slate-400 truncate">{task.name}</span>
                              </span>
                              <span className="text-slate-400 shrink-0 ml-2">
                                {task.end} · {task.progress}%
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
