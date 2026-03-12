"use client"

import { useState } from "react"
import { format, isSameDay } from "date-fns"
import { pt } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Phone } from "lucide-react"
import type { CalendarEvent } from "./types"

type Props = {
  events: CalendarEvent[]
}

export function CalendarListView({ events }: Props) {
  const [visibleCount, setVisibleCount] = useState(5)

  if (events.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Sem eventos</p>
          <p className="text-xs text-muted-foreground">
            Não há eventos futuros para mostrar.
          </p>
        </div>
      </div>
    )
  }

  const visible = events.slice(0, visibleCount)
  const hasMore = events.length > visibleCount

  let lastDate: Date | null = null

  return (
    <div className="space-y-2">
      {visible.map((event) => {
        const eventDate = new Date(event.start)
        const showSeparator = !lastDate || !isSameDay(lastDate, eventDate)
        lastDate = eventDate

        return (
          <div key={event.id}>
            {showSeparator && (
              <div className="sticky top-0 z-10 -mx-1 mb-2 mt-3 first:mt-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {format(eventDate, "EEEE, d 'de' MMMM", { locale: pt })}
                </p>
                <div className="mt-1 h-px bg-border" />
              </div>
            )}

            <div
              className={`rounded-lg border p-4 ${
                event.source === "google"
                  ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      event.source === "google"
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-primary/10"
                    }`}
                  >
                    <Calendar
                      className={`h-4 w-4 ${
                        event.source === "google"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-primary"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {event.serviceName && <span>{event.serviceName}</span>}
                      {event.customerPhone && (
                        <span className="flex items-center gap-0.5">
                          <Phone className="h-3 w-3" />
                          {event.customerPhone}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                      {event.source === "google" && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Google
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {event.allDay ? (
                    <p className="text-xs font-medium text-muted-foreground">
                      Dia inteiro
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.start), "HH:mm")}
                      {" — "}
                      {format(new Date(event.end), "HH:mm")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((c) => c + 5)}
          >
            Ver mais ({events.length - visibleCount} restantes)
          </Button>
        </div>
      )}
    </div>
  )
}
