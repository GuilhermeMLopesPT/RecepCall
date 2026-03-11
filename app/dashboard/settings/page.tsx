"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUserBusiness, type Business } from "@/lib/supabase/get-business"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [businessTimezone, setBusinessTimezone] = useState("")
  const [businessGreeting, setBusinessGreeting] = useState("")
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const [loadingBusiness, setLoadingBusiness] = useState(false)
  const [savedBusiness, setSavedBusiness] = useState(false)

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
        setBusinessName(b.name)
        setBusinessPhone(b.phone_number || "")
        setBusinessTimezone(b.timezone)
        setBusinessGreeting(b.greeting_message || "")
      }
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

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault()
    if (!businessId) return
    setLoadingBusiness(true)
    setSavedBusiness(false)

    const supabase = createClient()
    await supabase.from("businesses").update({
      name: businessName,
      phone_number: businessPhone || null,
      timezone: businessTimezone,
      greeting_message: businessGreeting || null,
    }).eq("id", businessId)

    setLoadingBusiness(false)
    setSavedBusiness(true)
    setTimeout(() => setSavedBusiness(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Definições</h1>
        <p className="text-muted-foreground">
          Gerir a sua conta e a sua empresa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Empresa</CardTitle>
          <CardDescription>Dados da sua empresa e configuração do assistente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBusiness} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="biz-name">Nome da empresa</Label>
              <Input id="biz-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex: Clínica Saúde Total" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-phone">Telefone</Label>
              <Input id="biz-phone" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+351 912 345 678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-tz">Fuso horário</Label>
              <Input id="biz-tz" value={businessTimezone} onChange={(e) => setBusinessTimezone(e.target.value)} placeholder="Europe/Lisbon" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-greeting">Mensagem de boas-vindas</Label>
              <Input id="biz-greeting" value={businessGreeting} onChange={(e) => setBusinessGreeting(e.target.value)} placeholder="Olá! Bem-vindo à nossa empresa..." />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loadingBusiness || !businessId}>
                {loadingBusiness ? "A guardar..." : "Guardar empresa"}
              </Button>
              {savedBusiness && <span className="text-sm text-primary">Guardado!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

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
