"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Play, Pause, Phone, ChevronDown } from "lucide-react"

const BAR_COUNT = 48

type Voice = {
  id: string
  name: string
  gender: "feminine" | "masculine"
  file: string
  customer: string
  conversation: { speaker: "assistant" | "customer"; text: string }[]
}

const VOICES: Voice[] = [
  {
    id: "daniela",
    name: "Daniela",
    gender: "feminine",
    file: "/voices/daniela.mp3",
    customer: "Duarte",
    conversation: [
      { speaker: "assistant", text: "Olá, bom dia! Está a ligar para a Clínica RecepCall, em que posso ajudar?" },
      { speaker: "customer", text: "Olá, muito bom dia! O meu nome é Duarte e queria saber se era possível fazer uma marcação para uma consulta de rotina esta semana." },
      { speaker: "assistant", text: "Claro que sim, Duarte! Em que dia lhe seria mais oportuno passar por cá?" },
      { speaker: "customer", text: "Talvez na quinta-feira de manhã. Acha que é possível?" },
      { speaker: "assistant", text: "Deixe-me só confirmar com a nossa agenda..." },
      { speaker: "assistant", text: "Sim, temos vaga das 9 às 10. Pode ser?" },
      { speaker: "customer", text: "Sim, está ótimo! Fica então agendado! Muito obrigado!" },
      { speaker: "assistant", text: "Ora essa! Obrigada nós. Tenha uma ótima semana!" },
    ],
  },
  {
    id: "marta",
    name: "Marta",
    gender: "feminine",
    file: "/voices/marta.mp3",
    customer: "Duarte",
    conversation: [
      { speaker: "assistant", text: "Olá, bom dia! Está a ligar para a Clínica RecepCall, em que posso ajudar?" },
      { speaker: "customer", text: "Olá, muito bom dia! O meu nome é Duarte e queria saber se era possível fazer uma marcação para uma consulta de rotina esta semana." },
      { speaker: "assistant", text: "Claro que sim, Duarte! Em que dia lhe seria mais oportuno passar por cá?" },
      { speaker: "customer", text: "Talvez na quinta-feira de manhã. Acha que é possível?" },
      { speaker: "assistant", text: "Deixe-me só confirmar com a nossa agenda..." },
      { speaker: "assistant", text: "Sim, temos vaga das 9 às 10. Pode ser?" },
      { speaker: "customer", text: "Sim, está ótimo! Fica então agendado! Muito obrigado!" },
      { speaker: "assistant", text: "Ora essa! Obrigada nós. Tenha uma ótima semana!" },
    ],
  },
  {
    id: "paulo",
    name: "Paulo",
    gender: "masculine",
    file: "/voices/paulo.mp3",
    customer: "Joana",
    conversation: [
      { speaker: "assistant", text: "Olá, bom dia! Está a ligar para a Clínica RecepCall, em que posso ajudar?" },
      { speaker: "customer", text: "Olá, bom dia! O meu nome é Joana e queria saber se era possível fazer uma marcação para uma consulta de rotina esta semana." },
      { speaker: "assistant", text: "Claro que sim, Joana! Em que dia lhe seria mais oportuno passar por cá?" },
      { speaker: "customer", text: "Talvez na quinta-feira de manhã. Acha que é possível?" },
      { speaker: "assistant", text: "Deixe-me só confirmar com a nossa agenda..." },
      { speaker: "assistant", text: "Sim, temos vaga das 9 às 10. Pode ser?" },
      { speaker: "customer", text: "Sim, está ótimo! Fica então agendado! Muito obrigada!" },
      { speaker: "assistant", text: "Ora essa! Obrigado nós. Tenha uma ótima semana!" },
    ],
  },
  {
    id: "joana",
    name: "Joana",
    gender: "feminine",
    file: "/voices/joana.mp3",
    customer: "Duarte",
    conversation: [
      { speaker: "assistant", text: "Olá, bom dia! Está a ligar para a Clínica RecepCall, em que posso ajudar?" },
      { speaker: "customer", text: "Olá, muito bom dia! O meu nome é Duarte e queria saber se era possível fazer uma marcação para uma consulta de rotina esta semana." },
      { speaker: "assistant", text: "Claro que sim, Duarte! Em que dia lhe seria mais oportuno passar por cá?" },
      { speaker: "customer", text: "Talvez na quinta-feira de manhã. Acha que é possível?" },
      { speaker: "assistant", text: "Deixe-me só confirmar com a nossa agenda..." },
      { speaker: "assistant", text: "Sim, temos vaga das 9 às 10. Pode ser?" },
      { speaker: "customer", text: "Sim, está ótimo! Fica então agendado! Muito obrigado!" },
      { speaker: "assistant", text: "Ora essa! Obrigada nós. Tenha uma ótima semana!" },
    ],
  },
]

function generateBars(count: number) {
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    const center = count / 2
    const dist = Math.abs(i - center) / center
    const base = 0.3 + (1 - dist) * 0.5
    const random = 0.15 + Math.random() * 0.85
    bars.push(base * random)
  }
  return bars
}

function ChatBubble({
  msg,
  voice,
  index,
  charProgress,
}: {
  msg: { speaker: "assistant" | "customer"; text: string }
  voice: Voice
  index: number
  charProgress: number
}) {
  const isAssistant = msg.speaker === "assistant"
  const visibleText = msg.text.slice(0, charProgress)
  const isTyping = charProgress > 0 && charProgress < msg.text.length

  if (charProgress <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAssistant
            ? "rounded-tl-sm bg-primary/15 text-foreground"
            : "rounded-tr-sm bg-muted/60 text-foreground"
        }`}
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isAssistant ? voice.name : voice.customer}
        </p>
        <span>{visibleText}</span>
        {isTyping && (
          <span className="inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle ml-0.5" />
        )}
      </div>
    </motion.div>
  )
}

export function VoiceDemo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: "-80px" })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)

  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showChat, setShowChat] = useState(false)

  const bars = useMemo(() => generateBars(BAR_COUNT), [])

  const totalChars = useMemo(
    () => selectedVoice.conversation.reduce((sum, m) => sum + m.text.length, 0),
    [selectedVoice],
  )

  const revealedChars = Math.floor(progress * totalChars)

  const messageCharProgress = useMemo(() => {
    const result: number[] = []
    let consumed = 0
    for (const msg of selectedVoice.conversation) {
      const remaining = revealedChars - consumed
      result.push(Math.max(0, Math.min(remaining, msg.text.length)))
      consumed += msg.text.length
    }
    return result
  }, [selectedVoice, revealedChars])

  useEffect(() => {
    if (chatEndRef.current && showChat) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [revealedChars, showChat])

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlaying(false)
    setProgress(0)
    setShowChat(false)
  }, [])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  function handlePlay() {
    if (playing) {
      cleanup()
      return
    }

    const audio = new Audio(selectedVoice.file)
    audioRef.current = audio
    audio.play()
    setPlaying(true)
    setShowChat(true)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (audio.duration && audio.duration > 0) {
        const p = audio.currentTime / audio.duration
        setProgress(Math.min(p, 1))

        if (p >= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setProgress(1)
          setTimeout(() => {
            setPlaying(false)
            setProgress(0)
            setShowChat(false)
          }, 2000)
        }
      }
    }, 50)

    audio.onended = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      setProgress(1)
      setTimeout(() => {
        setPlaying(false)
        setProgress(0)
        setShowChat(false)
      }, 2000)
    }
  }

  function handleSelectVoice(voice: Voice) {
    if (playing) cleanup()
    setSelectedVoice(voice)
    setDropdownOpen(false)
  }

  const filledBars = Math.floor(progress * BAR_COUNT)

  const feminineVoices = VOICES.filter((v) => v.gender === "feminine")
  const masculineVoices = VOICES.filter((v) => v.gender === "masculine")

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Ouça a nossa <span className="text-primary">IA em ação</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
            Uma conversa real entre o nosso assistente e um cliente. Escolha uma voz e carregue em play.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div className="relative rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm sm:p-8">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <div className="relative">
              {/* Header with voice selector */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Assistente RecepCall</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedVoice.name} conversa com {selectedVoice.customer}
                    </p>
                  </div>
                </div>

                {/* Voice selector dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {selectedVoice.name}
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-border/50 bg-card shadow-xl shadow-black/20"
                        >
                          <div className="p-1.5">
                            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Vozes Femininas
                            </p>
                            {feminineVoices.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => handleSelectVoice(v)}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                                  selectedVoice.id === v.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground hover:bg-muted/50"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${selectedVoice.id === v.id ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                {v.name}
                              </button>
                            ))}

                            <div className="my-1 h-px bg-border/50" />

                            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Vozes Masculinas
                            </p>
                            {masculineVoices.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => handleSelectVoice(v)}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                                  selectedVoice.id === v.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground hover:bg-muted/50"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${selectedVoice.id === v.id ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                {v.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Player */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlay}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
                >
                  {playing ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5" />
                  )}
                </button>

                {/* Waveform bars */}
                <div className="flex flex-1 items-center gap-[2px]">
                  {bars.map((height, i) => (
                    <div
                      key={i}
                      className="relative flex-1 overflow-hidden rounded-full"
                      style={{ height: `${Math.max(height * 40, 4)}px` }}
                    >
                      <div className="absolute inset-0 rounded-full bg-muted-foreground/20" />
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        initial={false}
                        animate={{
                          scaleX: i < filledBars ? 1 : 0,
                          opacity: i < filledBars ? 1 : 0,
                        }}
                        transition={{ duration: 0.05 }}
                        style={{ transformOrigin: "left" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation chat */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-72 overflow-y-auto rounded-xl bg-muted/20 p-4 scrollbar-thin">
                      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Conversa em tempo real
                      </p>
                      <div className="space-y-3">
                        {selectedVoice.conversation.map((msg, i) => (
                          <ChatBubble
                            key={`${selectedVoice.id}-${i}`}
                            msg={msg}
                            voice={selectedVoice}
                            index={i}
                            charProgress={messageCharProgress[i]}
                          />
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
