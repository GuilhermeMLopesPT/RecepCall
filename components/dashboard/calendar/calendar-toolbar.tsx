"use client"

import { format, addWeeks, addDays, startOfWeek, endOfWeek } from "date-fns"
import { pt } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, List, CalendarDays, Calendar } from "lucide-react"
import type { ViewMode } from "./types"

type Props = {
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  currentDate: Date
  onDateChange: (d: Date) => void
}

export function CalendarToolbar({ view, onViewChange, currentDate, onDateChange }: Props) {
  function navigatePrev() {
    if (view === "week") onDateChange(addWeeks(currentDate, -1))
    else if (view === "day") onDateChange(addDays(currentDate, -1))
  }

  function navigateNext() {
    if (view === "week") onDateChange(addWeeks(currentDate, 1))
    else if (view === "day") onDateChange(addDays(currentDate, 1))
  }

  function goToToday() {
    onDateChange(new Date())
  }

  function getDateLabel() {
    if (view === "list") return ""
    if (view === "day") {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: pt })
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const startStr = format(weekStart, "d MMM", { locale: pt })
    const endStr = format(weekEnd, "d MMM yyyy", { locale: pt })
    return `${startStr} — ${endStr}`
  }

  const viewButtons: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    { value: "list", label: "Lista", icon: <List className="h-4 w-4" /> },
    { value: "week", label: "Semanal", icon: <CalendarDays className="h-4 w-4" /> },
    { value: "day", label: "Diária", icon: <Calendar className="h-4 w-4" /> },
  ]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center rounded-lg border p-1">
          {viewButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => onViewChange(btn.value)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === btn.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {btn.icon}
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {view !== "list" && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center text-sm font-medium capitalize">
            {getDateLabel()}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
