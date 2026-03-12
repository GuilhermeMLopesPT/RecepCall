"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Phone, Calendar, MessageSquare, Clock, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Phone,
    title: "Atendimento 24/7",
    description: "A sua linha nunca fica sem resposta. O RecepCall atende a qualquer hora do dia ou da noite.",
  },
  {
    icon: MessageSquare,
    title: "Conversas Naturais",
    description: "IA avançada que compreende contexto e responde de forma humana e profissional.",
  },
  {
    icon: Calendar,
    title: "Agendamento Automático",
    description: "Integra com o seu calendário e marca compromissos sem intervenção manual.",
  },
  {
    icon: Clock,
    title: "Economia de Tempo",
    description: "Reduza em até 80% o tempo gasto com atendimento telefónico repetitivo.",
  },
  {
    icon: Shield,
    title: "Seguro e Fiável",
    description: "Os seus dados protegidos com encriptação de ponta e conformidade RGPD.",
  },
  {
    icon: Zap,
    title: "Fácil Integração",
    description: "Ligue às suas ferramentas favoritas: Google Calendar, WhatsApp e muito mais.",
  },
]

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/60"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
          <feature.icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

export function Features() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" })

  return (
    <section id="recursos" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
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
            Tudo o que precisa para automatizar o{" "}
            <span className="text-primary">seu atendimento</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Recursos poderosos para transformar a forma como a sua empresa atende clientes.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
