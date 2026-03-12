"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUserBusiness, type BusinessHours, type DayHours } from "@/lib/supabase/get-business"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const DAY_LABELS: { key: keyof BusinessHours; label: string }[] = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: true, start: "09:00", end: "18:00" },
  tuesday: { open: true, start: "09:00", end: "18:00" },
  wednesday: { open: true, start: "09:00", end: "18:00" },
  thursday: { open: true, start: "09:00", end: "18:00" },
  friday: { open: true, start: "09:00", end: "18:00" },
  saturday: { open: false, start: "09:00", end: "13:00" },
  sunday: { open: false, start: "09:00", end: "13:00" },
}

export default function ConfigPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [businessName, setBusinessName] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [businessTimezone, setBusinessTimezone] = useState("")

  const [greeting, setGreeting] = useState("")

  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS)

  const [loadingBiz, setLoadingBiz] = useState(false)
  const [savedBiz, setSavedBiz] = useState(false)
  const [errorBiz, setErrorBiz] = useState<string | null>(null)
  const [loadingHours, setLoadingHours] = useState(false)
  const [savedHours, setSavedHours] = useState(false)
  const [errorHours, setErrorHours] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const ub = await getUserBusiness(supabase)
      if (!ub) return
      const b = ub.businesses
      setBusinessId(b.id)
      setBusinessName(b.name)
      setBusinessPhone(b.phone_number || "")
      setBusinessEmail(b.email || "")
      setBusinessTimezone(b.timezone)
      setGreeting(b.greeting_message || "")
      if (b.business_hours) setHours(b.business_hours)
    }
    load()
  }, [])

  function updateDay(day: keyof BusinessHours, patch: Partial<DayHours>) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch },
    }))
  }

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault()
    if (!businessId) return
    setLoadingBiz(true)
    setSavedBiz(false)
    setErrorBiz(null)

    const supabase = createClient()
    const { error } = await supabase
      .from("businesses")
      .update({
        name: businessName,
        phone_number: businessPhone || null,
        email: businessEmail || null,
        timezone: businessTimezone,
        greeting_message: greeting || null,
      })
      .eq("id", businessId)

    setLoadingBiz(false)
    if (error) {
      console.error("[Config] Save business error:", error)
      setErrorBiz(error.message)
    } else {
      setSavedBiz(true)
      setTimeout(() => setSavedBiz(false), 3000)
    }
  }

  async function handleSaveHours(e: React.FormEvent) {
    e.preventDefault()
    if (!businessId) return
    setLoadingHours(true)
    setSavedHours(false)
    setErrorHours(null)

    const supabase = createClient()
    const { error } = await supabase
      .from("businesses")
      .update({ business_hours: hours as unknown as Record<string, unknown> })
      .eq("id", businessId)

    setLoadingHours(false)
    if (error) {
      console.error("[Config] Save hours error:", error)
      setErrorHours(error.message)
    } else {
      setSavedHours(true)
      setTimeout(() => setSavedHours(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure a sua empresa, assistente IA e horário de funcionamento.
        </p>
      </div>

      {/* ── Empresa ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Empresa</CardTitle>
          <CardDescription>Dados gerais da sua empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBusiness} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="biz-name">Nome</Label>
                <Input
                  id="biz-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Clínica Saúde Total"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-phone">Telefone</Label>
                <Input
                  id="biz-phone"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="+351 912 345 678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-email">Email</Label>
                <Input
                  id="biz-email"
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="geral@empresa.pt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-tz">Fuso horário</Label>
                <Input
                  id="biz-tz"
                  value={businessTimezone}
                  onChange={(e) => setBusinessTimezone(e.target.value)}
                  placeholder="Europe/Lisbon"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="greeting">Mensagem de boas-vindas da IA</Label>
              <Input
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Olá! Bem-vindo à nossa empresa. Como posso ajudar?"
              />
              <p className="text-xs text-muted-foreground">
                Esta é a primeira frase que a IA diz quando atende uma chamada.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loadingBiz || !businessId}>
                {loadingBiz ? "A guardar..." : "Guardar"}
              </Button>
              {savedBiz && <span className="text-sm text-primary">Guardado!</span>}
              {errorBiz && <span className="text-sm text-destructive">Erro: {errorBiz}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Horário de Funcionamento ─────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
          <CardDescription>
            Defina os dias e horas em que a sua empresa está aberta. A agenda e o assistente IA adaptam-se automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveHours} className="space-y-4">
            <div className="space-y-3">
              {DAY_LABELS.map(({ key, label }) => {
                const day = hours[key]
                return (
                  <div
                    key={key}
                    className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors sm:gap-4 ${
                      day.open ? "bg-background" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={day.open}
                        onCheckedChange={(checked) => updateDay(key, { open: checked })}
                      />
                      <span className="min-w-[5rem] text-sm font-medium sm:w-36">{label}</span>
                    </div>

                    {day.open ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={day.start}
                          onChange={(e) => updateDay(key, { start: e.target.value })}
                          className="w-24 sm:w-28"
                        />
                        <span className="text-sm text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={day.end}
                          onChange={(e) => updateDay(key, { end: e.target.value })}
                          className="w-24 sm:w-28"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Encerrado</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loadingHours || !businessId}>
                {loadingHours ? "A guardar..." : "Guardar horário"}
              </Button>
              {savedHours && <span className="text-sm text-primary">Guardado!</span>}
              {errorHours && <span className="text-sm text-destructive">Erro: {errorHours}</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
