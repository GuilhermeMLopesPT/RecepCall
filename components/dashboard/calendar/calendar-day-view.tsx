"use client"

import { useMemo } from "react"
import { isSameDay, format, getISODay } from "date-fns"
import { pt } from "date-fns/locale"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
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
  onDateChange: (d: Date) => void
  startHour: number
  endHour: number
  businessHours: BusinessHours
}

export function CalendarDayView({
  events,
  currentDate,
  onDateChange,
  startHour,
  endHour,
  businessHours,
}: Props) {
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  )
  const totalHeight = hours.length * HOUR_HEIGHT

  const dh = businessHours[ISO_DAY_KEY[getISODay(currentDate)]]
  const isClosed = !dh.open
  const closedBlocks = useMemo(
    () => (isClosed ? [] : getClosedBlocks(dh, startHour, endHour)),
    [dh, startHour, endHour, isClosed],
  )

  const dayEvents = useMemo(
    () =>
      events.filter(
        (e) => !e.allDay && isSameDay(new Date(e.start), currentDate),
      ),
    [events, currentDate],
  )

  const allDayEvents = useMemo(
    () =>
      events.filter(
        (e) => e.allDay && isSameDay(new Date(e.start), currentDate),
      ),
    [events, currentDate],
  )

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Date picker sidebar */}
      <div className="shrink-0">
        <CalendarPicker
          mode="single"
          selected={currentDate}
          onSelect={(d) => d && onDateChange(d)}
          locale={pt}
          className="rounded-lg border"
        />
      </div>

      {/* Day grid */}
      <div className="flex-1 overflow-x-auto rounded-lg border">
        {/* Day header */}
        <div className="border-b bg-muted/30 p-3 text-center">
          <p className="text-sm font-medium capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: pt })}
          </p>
        </div>

        {isClosed ? (
          <div className="flex h-48 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Encerrado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                A empresa não está aberta neste dia.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* All-day events */}
            {allDayEvents.length > 0 && (
              <div className="border-b p-2">
                <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                  DIA INTEIRO
                </p>
                <div className="flex flex-wrap gap-1">
                  {allDayEvents.map((e) => (
                    <span
                      key={e.id}
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        e.source === "google"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      }`}
                    >
                      {e.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Time grid */}
            <div
              className="grid"
              style={{ gridTemplateColumns: "60px 1fr" }}
            >
              {/* Time labels */}
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

              {/* Events column */}
              <div className="relative" style={{ height: totalHeight }}>
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
                    className="absolute inset-x-1 rounded-lg border border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/40"
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
