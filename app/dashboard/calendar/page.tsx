import { createClient } from "@/lib/supabase/server"
import { getUserBusiness } from "@/lib/supabase/get-business"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default async function CalendarPage() {
  const supabase = await createClient()
  const ub = await getUserBusiness(supabase)
  const businessId = ub?.business_id

  const { data: appointments } = businessId
    ? await supabase
        .from("appointments")
        .select("id, customer_name, customer_phone, start_time, end_time, status, services(name)")
        .eq("business_id", businessId)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(50)
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Agendamentos marcados automaticamente pelo RecepCall.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>
            {appointments && appointments.length > 0
              ? `${appointments.length} agendamento${appointments.length > 1 ? "s" : ""} próximo${appointments.length > 1 ? "s" : ""}`
              : "Os compromissos marcados pela IA vão aparecer aqui."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appt) => {
                const service = appt.services as unknown as { name: string } | null
                return (
                  <div key={appt.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{appt.customer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service?.name ?? "Serviço"} &middot; {appt.customer_phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(appt.start_time).toLocaleDateString("pt-PT", {
                            day: "2-digit", month: "short",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appt.start_time).toLocaleTimeString("pt-PT", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                          {" — "}
                          {new Date(appt.end_time).toLocaleTimeString("pt-PT", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Sem agendamentos</p>
                <p className="text-sm text-muted-foreground">
                  Quando a IA marcar compromissos, eles aparecerão aqui.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
