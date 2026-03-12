"use client"

import { useRef } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Configure o seu assistente",
    description: "Personalize as respostas, horários de atendimento e regras de agendamento em minutos.",
  },
  {
    number: "02",
    title: "Ligue o seu número",
    description: "Redirecione as suas chamadas para o RecepCall ou utilize o nosso número dedicado.",
  },
  {
    number: "03",
    title: "Deixe a IA trabalhar",
    description: "O RecepCall atende, conversa e agenda. Receba notificações e resumos em tempo real.",
  },
]

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative flex flex-col items-center text-center"
    >
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-3xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
          {step.number}
        </div>
        {index < steps.length - 1 && (
          <div className="absolute left-full top-1/2 hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-primary/40 to-transparent lg:block" />
        )}
      </div>
      <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
      <p className="mt-3 max-w-xs leading-relaxed text-muted-foreground">
        {step.description}
      </p>
    </motion.div>
  )
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <section ref={sectionRef} id="como-funciona" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.03] via-transparent to-primary/[0.03]"
      />
      <div className="absolute right-0 top-0 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Em três passos simples, automatize todo o seu atendimento telefónico.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-12 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
