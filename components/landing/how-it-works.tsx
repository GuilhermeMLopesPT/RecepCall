export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Configure seu assistente",
      description: "Personalize as respostas, horarios de atendimento e regras de agendamento em minutos."
    },
    {
      number: "02", 
      title: "Conecte seu numero",
      description: "Redirecione suas ligacoes para o RecepCall ou use nosso numero dedicado."
    },
    {
      number: "03",
      title: "Deixe a IA trabalhar",
      description: "RecepCall atende, conversa e agenda. Voce recebe notificacoes e resumos em tempo real."
    }
  ]

  return (
    <section id="como-funciona" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Em tres passos simples, automatize todo seu atendimento telefonico.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-y-1/2 bg-border lg:block" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
