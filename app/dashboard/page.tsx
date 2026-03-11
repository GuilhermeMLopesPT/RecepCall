import { createClient } from "@/lib/supabase/server"
import { getUserBusiness } from "@/lib/supabase/get-business"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall, Calendar, Clock, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = (user?.user_metadata?.full_name as string) || "Utilizador"

  const ub = await getUserBusiness(supabase)
  const businessId = ub?.business_id

  let callsToday = 0
  let appointmentsWeek = 0
  let avgDuration = 0
  let successRate: number | null = null

  if (businessId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: callCount } = await supabase
      .from("calls")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", today.toISOString())

    callsToday = callCount ?? 0

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const { count: apptCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "booked")
      .gte("start_time", weekStart.toISOString())
      .lt("start_time", weekEnd.toISOString())

    appointmentsWeek = apptCount ?? 0

    const { data: callStats } = await supabase
      .from("calls")
      .select("duration_seconds, outcome")
      .eq("business_id", businessId)
      .gte("created_at", today.toISOString())

    if (callStats && callStats.length > 0) {
      avgDuration = Math.round(
        callStats.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / callStats.length / 60
      )
      const booked = callStats.filter((c) => c.outcome === "booked").length
      successRate = Math.round((booked / callStats.length) * 100)
    }
  }

  const { data: recentCalls } = businessId
    ? await supabase
        .from("calls")
        .select("id, caller_phone, outcome, duration_seconds, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null }

  const { data: upcomingAppts } = businessId
    ? await supabase
        .from("appointments")
        .select("id, customer_name, customer_phone, start_time, status, services(name)")
        .eq("business_id", businessId)
        .eq("status", "booked")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(5)
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {name}</h1>
        <p className="text-muted-foreground">Bem-vindo ao seu painel RecepCall.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chamadas Hoje</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callsToday}</div>
            <p className="text-xs text-muted-foreground">
              {callsToday === 0 ? "Nenhuma chamada ainda" : "chamadas hoje"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsWeek}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration}m</div>
            <p className="text-xs text-muted-foreground">Por chamada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {successRate !== null ? `${successRate}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {successRate !== null ? "chamadas com agendamento" : "Sem dados"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chamadas Recentes</CardTitle>
            <CardDescription>As suas últimas chamadas atendidas pela IA.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCalls && recentCalls.length > 0 ? (
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{call.caller_phone || "Desconhecido"}</p>
                      <p className="text-xs text-muted-foreground">
                        {call.duration_seconds}s &middot;{" "}
                        {new Date(call.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      call.outcome === "booked"
                        ? "bg-primary/10 text-primary"
                        : call.outcome === "question"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {call.outcome === "booked" ? "Agendado" : call.outcome === "question" ? "Pergunta" : "Perdida"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">Nenhuma chamada registada ainda.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Compromissos marcados pela IA.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppts && upcomingAppts.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppts.map((appt) => {
                  const service = appt.services as unknown as { name: string } | null
                  return (
                    <div key={appt.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{appt.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service?.name ?? "Serviço"} &middot;{" "}
                          {new Date(appt.start_time).toLocaleDateString("pt-PT", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{appt.customer_phone}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">Nenhum agendamento marcado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
