"use client"

import { format } from "date-fns"
import type { CalendarEvent } from "./types"

type Props = {
  event: CalendarEvent
  style?: React.CSSProperties
}

export function CalendarEventBlock({ event, style }: Props) {
  const isGoogle = event.source === "google"
  const startTime = format(new Date(event.start), "HH:mm")

  return (
    <div
      style={style}
      className={`absolute inset-x-0.5 overflow-hidden rounded px-1.5 py-0.5 text-[11px] leading-tight ${
        isGoogle
          ? "border border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
          : "border border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
      }`}
      title={`${event.title} (${startTime})`}
    >
      <p className="truncate font-medium">{event.title}</p>
      <p className="truncate opacity-75">{startTime}</p>
    </div>
  )
}

export const HOUR_HEIGHT = 48

export function getEventPosition(
  event: CalendarEvent,
  startHour: number,
  endHour: number,
) {
  const start = new Date(event.start)
  const end = new Date(event.end)

  const startMinutes = start.getHours() * 60 + start.getMinutes()
  const endMinutes = end.getHours() * 60 + end.getMinutes()

  const gridStartMinutes = startHour * 60
  const gridEndMinutes = endHour * 60

  const clampedStart = Math.max(startMinutes, gridStartMinutes)
  const clampedEnd = Math.min(endMinutes, gridEndMinutes)

  if (clampedStart >= clampedEnd) return null

  const top = ((clampedStart - gridStartMinutes) / 60) * HOUR_HEIGHT
  const height = Math.max(((clampedEnd - clampedStart) / 60) * HOUR_HEIGHT, 20)

  return { top, height }
}
