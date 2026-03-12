"use client"

import { useMemo } from "react"
import {
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  format,
  getISODay,
} from "date-fns"
import { pt } from "date-fns/locale"
import type { BusinessHours, DayHours } from "@/lib/supabase/get-business"
import {
  CalendarEventBlock,
  getEventPosition,
  HOUR_HEIGHT,
} from "./calendar-event-block"
import type { CalendarEvent } from "./types"

const ISO_DAY_KEY: Record<number, keyof BusinessHours> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h + m / 60
}

type ClosedBlock = { top: number; height: number }

function getClosedBlocks(
  dh: DayHours,
  gridStart: number,
  gridEnd: number,
): ClosedBlock[] {
  const gridH = (gridEnd - gridStart) * HOUR_HEIGHT

  if (!dh.open) {
    return [{ top: 0, height: gridH }]
  }

  const dayOpen = parseTime(dh.start)
  const dayClose = parseTime(dh.end)
  const blocks: ClosedBlock[] = []

  if (dayOpen > gridStart) {
    const h = (Math.min(dayOpen, gridEnd) - gridStart) * HOUR_HEIGHT
    blocks.push({ top: 0, height: h })
  }

  if (dayClose < gridEnd) {
    const top = (Math.max(dayClose, gridStart) - gridStart) * HOUR_HEIGHT
    blocks.push({ top, height: gridH - top })
  }

  return blocks
}

type Props = {
  events: CalendarEvent[]
  currentDate: Date
  startHour: number
  endHour: number
  businessHours: BusinessHours
}

export function CalendarWeekView({
  events,
  currentDate,
  startHour,
  endHour,
  businessHours,
}: Props) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  )
  const totalHeight = hours.length * HOUR_HEIGHT

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd")
      map.set(
        key,
        events.filter((e) => !e.allDay && isSameDay(new Date(e.start), day)),
      )
    }
    return map
  }, [events, days])

  return (
    <div className="overflow-x-auto rounded-lg border">
      {/* Header row with day names */}
      <div
        className="grid border-b bg-muted/30"
        style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
      >
        <div className="border-r p-2" />
        {days.map((day) => {
          const dh = businessHours[ISO_DAY_KEY[getISODay(day)]]
          return (
            <div
              key={day.toISOString()}
              className={`border-r p-2 text-center last:border-r-0 ${
                isToday(day) ? "bg-primary/5" : ""
              } ${!dh.open ? "opacity-50" : ""}`}
            >
              <p className="text-[11px] font-medium uppercase text-muted-foreground">
                {format(day, "EEE", { locale: pt })}
              </p>
              <p
                className={`text-lg font-semibold ${
                  isToday(day) ? "text-primary" : ""
                }`}
              >
                {format(day, "d")}
              </p>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
      >
        {/* Time labels column */}
        <div className="border-r" style={{ height: totalHeight }}>
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-end border-b pr-2 pt-0.5 text-[11px] text-muted-foreground"
              style={{ height: HOUR_HEIGHT }}
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const dayEvents = eventsByDay.get(key) ?? []
          const dh = businessHours[ISO_DAY_KEY[getISODay(day)]]
          const closedBlocks = getClosedBlocks(dh, startHour, endHour)

          return (
            <div
              key={key}
              className={`relative border-r last:border-r-0 ${
                isToday(day) ? "bg-primary/[0.02]" : ""
              }`}
              style={{ height: totalHeight }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-b"
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}

              {closedBlocks.map((block, i) => (
                <div
                  key={`closed-${i}`}
                  className="absolute inset-x-0.5 rounded-lg border border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/40"
                  style={{ top: block.top + 2, height: block.height - 4 }}
                >
                  {block.height >= HOUR_HEIGHT * 1.5 && (
                    <div className="flex h-full items-center justify-center">
                      <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-900/60 dark:text-red-300">
                        Encerrado
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {dayEvents.map((event) => {
                const pos = getEventPosition(event, startHour, endHour)
                if (!pos) return null
                return (
                  <CalendarEventBlock
                    key={event.id}
                    event={event}
                    style={{ top: pos.top, height: pos.height }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
