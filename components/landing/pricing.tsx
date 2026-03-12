"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Inicial",
    price: "29",
    description: "Perfeito para profissionais independentes e pequenos negócios.",
    features: [
      "100 minutos de chamadas/mês",
      "Agendamento automático",
      "1 número de telefone",
      "Integração Google Calendar",
      "Suporte por email",
    ],
    cta: "Começar Agora",
    popular: false,
  },
  {
    name: "Profissional",
    price: "79",
    description: "Ideal para clínicas, escritórios e empresas em crescimento.",
    features: [
      "500 minutos de chamadas/mês",
      "Agendamento automático",
      "3 números de telefone",
      "Todas as integrações",
      "Integração WhatsApp",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    cta: "Começar Agora",
    popular: true,
  },
  {
    name: "Empresarial",
    price: "149",
    description: "Para empresas que precisam de escala e personalização.",
    features: [
      "Minutos ilimitados",
      "Números ilimitados",
      "API personalizada",
      "Treino da IA personalizado",
      "Gestor de conta dedicado",
      "SLA garantido",
      "Onboarding personalizado",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
]

function PlanCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className={`relative flex flex-col rounded-2xl border p-8 ${
        plan.popular
          ? "border-primary/50 bg-gradient-to-b from-primary/10 to-card/50 shadow-xl shadow-primary/10"
          : "border-border/40 bg-card/30"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-purple-500 px-4 py-1 text-xs font-semibold text-primary-foreground">
          Mais Popular
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
      </div>
      <div className="mt-6 mb-6">
        <span className="text-4xl font-bold">{plan.price}€</span>
        <span className="text-muted-foreground">/mês</span>
      </div>
      <ul className="flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
          asChild
        >
          <Link href="/auth/sign-up">{plan.cta}</Link>
        </Button>
      </div>
    </motion.div>
  )
}

export function Pricing() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" })

  return (
    <section id="precos" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Planos que cabem no seu <span className="text-primary">orçamento</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Escolha o plano ideal para o tamanho do seu negócio. Todos incluem 14 dias grátis.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
