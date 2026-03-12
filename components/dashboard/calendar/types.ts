export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  source: "recepcall" | "google"
  location?: string
  customerPhone?: string
  serviceName?: string
}

export type ViewMode = "list" | "week" | "day"
