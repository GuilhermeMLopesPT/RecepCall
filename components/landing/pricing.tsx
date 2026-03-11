import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Inicial",
    price: "97",
    description: "Perfeito para profissionais autonomos e pequenos negocios.",
    features: [
      "100 minutos de chamadas/mes",
      "Agendamento automatico",
      "1 numero de telefone",
      "Integracao Google Calendar",
      "Suporte por email"
    ],
    cta: "Comecar Agora",
    popular: false
  },
  {
    name: "Profissional",
    price: "247",
    description: "Ideal para clinicas, escritorios e empresas em crescimento.",
    features: [
      "500 minutos de chamadas/mes",
      "Agendamento automatico",
      "3 numeros de telefone",
      "Todas as integracoes",
      "Integracao WhatsApp",
      "Relatorios avancados",
      "Suporte prioritario"
    ],
    cta: "Comecar Agora",
    popular: true
  },
  {
    name: "Empresarial",
    price: "497",
    description: "Para empresas que precisam de escala e personalizacao.",
    features: [
      "Minutos ilimitados",
      "Numeros ilimitados",
      "API personalizada",
      "Treinamento da IA customizado",
      "Gerente de conta dedicado",
      "SLA garantido",
      "Onboarding personalizado"
    ],
    cta: "Falar com Vendas",
    popular: false
  }
]

export function Pricing() {
  return (
    <section id="precos" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Planos que cabem no seu bolso
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Escolha o plano ideal para o tamanho do seu negocio. Todos incluem 14 dias gratis.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg" : "border-border/50"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Mais Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">R${plan.price}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth/sign-up">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
