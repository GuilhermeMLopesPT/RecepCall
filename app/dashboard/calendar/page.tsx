"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getUserBusiness, type BusinessHours } from "@/lib/supabase/get-business"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { CalendarToolbar } from "@/components/dashboard/calendar/calendar-toolbar"
import { CalendarListView } from "@/components/dashboard/calendar/calendar-list-view"
import { CalendarWeekView } from "@/components/dashboard/calendar/calendar-week-view"
import { CalendarDayView } from "@/components/dashboard/calendar/calendar-day-view"
import type { CalendarEvent, ViewMode } from "@/components/dashboard/calendar/types"

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: true, start: "09:00", end: "18:00" },
  tuesday: { open: true, start: "09:00", end: "18:00" },
  wednesday: { open: true, start: "09:00", end: "18:00" },
  thursday: { open: true, start: "09:00", end: "18:00" },
  friday: { open: true, start: "09:00", end: "18:00" },
  saturday: { open: false, start: "09:00", end: "13:00" },
  sunday: { open: false, start: "09:00", end: "13:00" },
}

function computeGridRange(bh: BusinessHours): {
  startHour: number
  endHour: number
} {
  let earliest = 24
  let latest = 0

  for (const key of Object.keys(bh) as (keyof BusinessHours)[]) {
    const day = bh[key]
    if (!day.open) continue
    const [sh, sm] = day.start.split(":").map(Number)
    const [eh, em] = day.end.split(":").map(Number)
    const startDecimal = sh + sm / 60
    const endDecimal = eh + em / 60
    if (startDecimal < earliest) earliest = startDecimal
    if (endDecimal > latest) latest = endDecimal
  }

  if (earliest >= latest) {
    return { startHour: 9, endHour: 18 }
  }

  return {
    startHour: Math.floor(earliest),
    endHour: Math.ceil(latest),
  }
}

export default function CalendarPage() {
  const isMobile = useIsMobile()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [gcalConnected, setGcalConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>("list")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null)

  useEffect(() => {
    if (isMobile && view === "week") {
      setView("day")
    }
  }, [isMobile, view])

  useEffect(() => {
    async function loadData() {
      const [appointments, google] = await Promise.all([
        loadAppointments(),
        loadGoogleEvents(),
      ])

      const merged = [...appointments, ...google].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      )
      setEvents(merged)
      setLoading(false)
    }
    loadData()
  }, [])

  async function loadAppointments(): Promise<CalendarEvent[]> {
    const supabase = createClient()
    const ub = await getUserBusiness(supabase)
    if (!ub) return []

    const b = ub.businesses
    if (b.business_hours) setBusinessHours(b.business_hours)

    const { data } = await supabase
      .from("appointments")
      .select(
        "id, customer_name, customer_phone, start_time, end_time, status, services(name)",
      )
      .eq("business_id", ub.business_id)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(50)

    if (!data) return []

    return data.map((d) => {
      const svc = d.services as unknown as { name: string } | null
      return {
        id: d.id,
        title: d.customer_name,
        start: d.start_time,
        end: d.end_time,
        allDay: false,
        source: "recepcall" as const,
        customerPhone: d.customer_phone,
        serviceName: svc?.name,
      }
    })
  }

  async function loadGoogleEvents(): Promise<CalendarEvent[]> {
    try {
      const res = await fetch("/api/google/events")
      const json = await res.json()
      setGcalConnected(json.connected ?? false)
      return (json.events ?? []).map(
        (e: {
          id: string
          title: string
          start: string
          end: string
          allDay: boolean
          location?: string
        }) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.allDay,
          source: "google" as const,
          location: e.location,
        }),
      )
    } catch {
      return []
    }
  }

  const resolvedHours = useMemo(
    () => businessHours ?? DEFAULT_HOURS,
    [businessHours],
  )

  const { startHour, endHour } = useMemo(
    () => computeGridRange(resolvedHours),
    [resolvedHours],
  )

  const filteredEvents = useMemo(() => events, [events])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            Agendamentos do RecepCall e eventos do Google Calendar.
          </p>
        </div>
        {!loading && !gcalConnected && (
          <Button size="sm" variant="outline" asChild>
            <Link href="/api/google/auth">
              <ExternalLink className="mr-2 h-4 w-4" />
              Conectar Google Calendar
            </Link>
          </Button>
        )}
      </div>

      <CalendarToolbar
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : view === "list" ? (
            <CalendarListView events={filteredEvents} />
          ) : view === "week" ? (
            <CalendarWeekView
              events={filteredEvents}
              currentDate={currentDate}
              startHour={startHour}
              endHour={endHour}
              businessHours={resolvedHours}
            />
          ) : (
            <CalendarDayView
              events={filteredEvents}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              startHour={startHour}
              endHour={endHour}
              businessHours={resolvedHours}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
