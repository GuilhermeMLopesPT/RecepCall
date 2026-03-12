"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1])

  return (
    <section ref={ref} className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          style={{ scale: bgScale }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-violet-700 px-6 py-20 text-center sm:px-12 lg:px-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(255,255,255,0.05)_0%,_transparent_40%)]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pronto para transformar o seu atendimento?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/80">
              Junte-se a centenas de empresas que já poupam tempo e nunca mais perdem clientes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="px-8" asChild>
                <Link href="/auth/sign-up">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/60">
              14 dias grátis. Cancele quando quiser.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
