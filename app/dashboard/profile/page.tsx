"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getUserBusiness } from "@/lib/supabase/get-business"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const searchParams = useSearchParams()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)

  const [gcalConnected, setGcalConnected] = useState(false)
  const [gcalEmail, setGcalEmail] = useState<string | null>(null)
  const [gcalLoading, setGcalLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  const integrationResult = searchParams.get("integration")

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setName((user.user_metadata?.full_name as string) || "")
        setEmail(user.email || "")
      }

      const ub = await getUserBusiness(supabase)
      if (ub) {
        const b = ub.businesses
        setBusinessId(b.id)

        const { data: integration } = await supabase
          .from("integrations")
          .select("account_email")
          .eq("business_id", b.id)
          .eq("provider", "google_calendar")
          .single()

        if (integration) {
          setGcalConnected(true)
          setGcalEmail(integration.account_email)
        }
      }
      setGcalLoading(false)
    }
    load()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoadingProfile(true)
    setSavedProfile(false)

    const supabase = createClient()
    await supabase.auth.updateUser({ data: { full_name: name } })

    setLoadingProfile(false)
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 3000)
  }

  async function handleDisconnectGoogle() {
    setDisconnecting(true)
    await fetch("/api/google/disconnect", { method: "DELETE" })
    setGcalConnected(false)
    setGcalEmail(null)
    setDisconnecting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Gerir a sua conta pessoal e integrações.
        </p>
      </div>

      {/* ── Perfil ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Informações da sua conta pessoal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="O seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loadingProfile}>
                {loadingProfile ? "A guardar..." : "Guardar perfil"}
              </Button>
              {savedProfile && <span className="text-sm text-primary">Guardado!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Integrações ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Conecte serviços externos à sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {integrationResult === "success" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <CheckCircle2 className="h-4 w-4" />
              Google Calendar conectado com sucesso!
            </div>
          )}
          {integrationResult === "error" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <XCircle className="h-4 w-4" />
              Erro ao conectar o Google Calendar. Tente novamente.
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Google Calendar</p>
                {gcalLoading ? (
                  <p className="text-sm text-muted-foreground">A verificar...</p>
                ) : gcalConnected ? (
                  <p className="text-sm text-muted-foreground">
                    Conectado — {gcalEmail}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sincronize os seus eventos com a Agenda.
                  </p>
                )}
              </div>
            </div>
            {gcalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : gcalConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGoogle}
                disabled={disconnecting}
              >
                {disconnecting ? "A desconectar..." : "Desconectar"}
              </Button>
            ) : (
              <Button size="sm" asChild>
                <a href="/api/google/auth">Conectar</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Plano ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
          <CardDescription>O seu plano atual e utilização.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Plano Gratuito</p>
              <p className="text-sm text-muted-foreground">Período de teste — 14 dias grátis</p>
            </div>
            <Button variant="outline">Atualizar Plano</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
