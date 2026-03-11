import { createClient } from "@/lib/supabase/server"
import { getUserBusiness } from "@/lib/supabase/get-business"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall } from "lucide-react"

export default async function CallsPage() {
  const supabase = await createClient()
  const ub = await getUserBusiness(supabase)
  const businessId = ub?.business_id

  const { data: calls } = businessId
    ? await supabase
        .from("calls")
        .select("id, caller_phone, duration_seconds, outcome, transcript, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chamadas</h1>
        <p className="text-muted-foreground">
          Histórico de todas as chamadas atendidas pelo RecepCall.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chamadas</CardTitle>
          <CardDescription>
            {calls && calls.length > 0
              ? `${calls.length} chamada${calls.length > 1 ? "s" : ""} registada${calls.length > 1 ? "s" : ""}`
              : "Quando o RecepCall começar a atender chamadas, elas aparecerão aqui."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calls && calls.length > 0 ? (
            <div className="space-y-3">
              {calls.map((call) => (
                <div key={call.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <PhoneCall className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{call.caller_phone || "Desconhecido"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(call.created_at).toLocaleDateString("pt-PT", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                          {" · "}{call.duration_seconds}s
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      call.outcome === "booked"
                        ? "bg-primary/10 text-primary"
                        : call.outcome === "question"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {call.outcome === "booked" ? "Agendado" : call.outcome === "question" ? "Pergunta" : "Perdida"}
                    </span>
                  </div>
                  {call.transcript && (
                    <p className="text-xs text-muted-foreground whitespace-pre-line border-t pt-2 mt-2">
                      {call.transcript.length > 200 ? call.transcript.slice(0, 200) + "..." : call.transcript}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <PhoneCall className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium">Sem chamadas</p>
                <p className="text-sm text-muted-foreground">
                  Configure o seu assistente para começar a receber chamadas.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
