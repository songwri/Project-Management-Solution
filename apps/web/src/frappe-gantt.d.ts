// frappe-gantt ships no TypeScript declarations; this is a minimal
// ambient module covering the surface this app actually uses.
declare module 'frappe-gantt' {
  export interface GanttTask {
    id: string
    name: string
    start: string
    end: string
    progress?: number
    dependencies?: string
    custom_class?: string
  }

  export interface GanttPopupContext {
    task: GanttTask & { _start: Date; _end: Date }
    chart: unknown
    set_title: (html: string) => void
    set_subtitle: (html: string) => void
    set_details: (html: string) => void
  }

  export interface GanttOptions {
    view_mode?: 'Day' | 'Week' | 'Month' | 'Year'
    bar_height?: number
    bar_corner_radius?: number
    padding?: number
    readonly?: boolean
    popup_on?: 'click' | 'hover'
    popup?: (ctx: GanttPopupContext) => string | false | void
    on_click?: (task: GanttTask) => void
    [key: string]: unknown
  }

  export default class Gantt {
    constructor(wrapper: HTMLElement | string, tasks: GanttTask[], options?: GanttOptions)
    change_view_mode(mode: string): void
  }
}
