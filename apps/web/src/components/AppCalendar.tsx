import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import koLocale from '@fullcalendar/core/locales/ko'
import type { EventInput, EventClickArg } from '@fullcalendar/core'

interface Props {
  events: EventInput[]
  onEventClick?: (arg: EventClickArg) => void
  initialView?: 'dayGridMonth' | 'listMonth'
}

export function AppCalendar({ events, onEventClick, initialView = 'dayGridMonth' }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 sm:p-3">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listMonth',
        }}
        buttonText={{ today: '오늘', month: '월간', list: '목록' }}
        locale={koLocale}
        height="auto"
        events={events}
        eventClick={onEventClick}
        dayMaxEventRows={4}
        firstDay={1}
      />
    </div>
  )
}
