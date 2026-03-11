import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
          Novo: Integracao com WhatsApp disponivel
        </div>
        
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Seu assistente de telefone com{" "}
          <span className="text-primary">inteligencia artificial</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          RecepCall atende suas ligacoes, conversa naturalmente com seus clientes e agenda compromissos automaticamente. Nunca mais perca uma oportunidade.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/auth/sign-up">
              Comecar Gratuitamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Play className="mr-2 h-4 w-4" />
            Ver Demonstracao
          </Button>
        </div>
        
        <p className="mt-4 text-sm text-muted-foreground">
          Sem cartao de credito. 14 dias gratis.
        </p>
      </div>
    </section>
  )
}
