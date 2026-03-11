import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Calendar, MessageSquare, Clock, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Phone,
    title: "Atendimento 24/7",
    description: "Sua linha nunca fica sem atendimento. RecepCall responde a qualquer hora do dia ou da noite."
  },
  {
    icon: MessageSquare,
    title: "Conversas Naturais",
    description: "IA avancada que entende contexto e responde de forma humana e profissional."
  },
  {
    icon: Calendar,
    title: "Agendamento Automatico",
    description: "Integra com seu calendario e marca compromissos sem intervencao manual."
  },
  {
    icon: Clock,
    title: "Economia de Tempo",
    description: "Reduza em ate 80% o tempo gasto com atendimento telefonico repetitivo."
  },
  {
    icon: Shield,
    title: "Seguro e Confiavel",
    description: "Seus dados protegidos com criptografia de ponta e conformidade LGPD."
  },
  {
    icon: Zap,
    title: "Facil Integracao",
    description: "Conecte com suas ferramentas favoritas: Google Calendar, WhatsApp e mais."
  }
]

export function Features() {
  return (
    <section id="recursos" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que voce precisa para automatizar seu atendimento
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Recursos poderosos para transformar a forma como sua empresa atende clientes.
          </p>
        </div>
        
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
