"use client"

import Link from "next/link"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, Calendar, MessageSquare } from "lucide-react"

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95])

  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -180])
  const orbY3 = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
      {/* Animated background orbs */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]"
      />
      <motion.div
        style={{ y: orbY3 }}
        className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-violet-600/8 blur-[80px]"
      />

      <motion.div style={{ y, opacity, scale }} className="relative mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary"
        >
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          Automatize o seu atendimento telefónico
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          O seu assistente de telefone com{" "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-violet-400 bg-clip-text text-transparent">
            inteligência artificial
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          O RecepCall atende as suas chamadas, conversa naturalmente com os seus clientes e agenda compromissos automaticamente. Nunca mais perca uma oportunidade.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" className="w-full px-8 sm:w-auto" asChild>
            <Link href="/auth/sign-up">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full px-8 sm:w-auto border-primary/20 hover:bg-primary/5">
            <Link href="#como-funciona">Ver Como Funciona</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-5 text-sm text-muted-foreground"
        >
          Sem cartão de crédito. 14 dias grátis.
        </motion.p>

        {/* Floating feature pills */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-4">
          {[
            { icon: Phone, label: "Atendimento 24/7" },
            { icon: MessageSquare, label: "Conversas Naturais" },
            { icon: Calendar, label: "Agendamento Automático" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2.5 rounded-full border border-border/50 bg-card/50 px-5 py-2.5 backdrop-blur-sm"
            >
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
