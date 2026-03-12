"use client"

import { useRef, useState, useEffect, useCallback, useMemo, Fragment } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import {
  Play, Pause, Phone, ChevronDown, Calendar, Check,
  LayoutDashboard, PhoneCall, Settings, User2,
} from "lucide-react"

const BAR_COUNT = 48
const AGENDA_MSG_INDEX = 4

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
    id: "daniela", name: "Daniela", gender: "feminine",
    file: "/voices/daniela.mp3", customer: "Duarte",
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
    id: "marta", name: "Marta", gender: "feminine",
    file: "/voices/marta.mp3", customer: "Duarte",
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
    id: "paulo", name: "Paulo", gender: "masculine",
    file: "/voices/paulo.mp3", customer: "Joana",
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
    id: "joao", name: "João", gender: "masculine",
    file: "/voices/joao.mp3", customer: "Joana",
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
]

function wordCount(text: string) { return text.split(/\s+/).length }

/** Duration (ms) to pause audio while mini dashboard runs after "confirmar agenda" */
const AGENDA_PAUSE_MS = 3800

/* ─── Mini Dashboard ─────────────────────────────────────────── */

type DashPhase = "hidden" | "overview" | "navigating" | "scanning" | "found" | "confirmed"

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"]
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"]

type Slot = { day: number; hour: number; span: number; label: string }
const BOOKED: Slot[] = [
  { day: 0, hour: 0, span: 2, label: "Consulta" },
  { day: 0, hour: 3, span: 1, label: "Check-up" },
  { day: 1, hour: 1, span: 1, label: "Exame" },
  { day: 1, hour: 3, span: 2, label: "Reunião" },
  { day: 2, hour: 0, span: 1, label: "Limpeza" },
  { day: 2, hour: 2, span: 2, label: "Consulta" },
  { day: 3, hour: 2, span: 1, label: "Exame" },
  { day: 3, hour: 4, span: 1, label: "Reunião" },
  { day: 4, hour: 0, span: 2, label: "Consulta" },
  { day: 4, hour: 3, span: 1, label: "Check-up" },
]

const NAV = [
  { icon: LayoutDashboard, label: "Visão Geral", id: "overview" },
  { icon: PhoneCall, label: "Chamadas", id: "calls" },
  { icon: Calendar, label: "Agenda", id: "agenda" },
  { icon: Settings, label: "Configurações", id: "config" },
  { icon: User2, label: "Perfil", id: "profile" },
]

function MiniDashboard({ phase }: { phase: DashPhase }) {
  const showOverview = phase === "overview" || phase === "navigating"
  const showAgenda = phase === "scanning" || phase === "found" || phase === "confirmed"
  const activeTab = showAgenda ? "agenda" : "overview"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="mx-auto my-3 w-full max-w-[95%]"
    >
      <div className="overflow-hidden rounded-xl border border-primary/20 bg-background/90 shadow-lg shadow-primary/5">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-28 shrink-0 border-r border-border/30 bg-muted/20 py-2 sm:block">
            <div className="mb-2 flex items-center gap-1.5 px-2.5">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-primary">
                <Phone className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
              <span className="text-[8px] font-bold">RecepCall</span>
            </div>
            {NAV.map((n) => (
              <motion.div
                key={n.id}
                animate={
                  n.id === activeTab
                    ? { backgroundColor: "rgba(168,85,247,0.12)" }
                    : { backgroundColor: "transparent" }
                }
                transition={{ duration: 0.3 }}
                className={`mx-1 flex items-center gap-1.5 rounded-md px-2 py-1 ${
                  n.id === activeTab ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <n.icon className="h-3 w-3" />
                <span className="text-[8px] font-medium">{n.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-2.5">
            <AnimatePresence mode="wait">
              {showOverview && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="mb-2 text-[10px] font-semibold">Olá, Clínica RecepCall</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Chamadas Hoje", value: "12" },
                      { label: "Agendamentos", value: "8" },
                      { label: "Taxa Sucesso", value: "91%" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-border/30 bg-card/60 p-2">
                        <p className="text-[8px] text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-bold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {phase === "navigating" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1] }}
                      className="mt-2 text-center text-[9px] text-primary"
                    >
                      A abrir Agenda...
                    </motion.div>
                  )}
                </motion.div>
              )}

              {showAgenda && (
                <motion.div
                  key="agenda"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold">Agenda — Semana Atual</span>
                    </div>
                    {phase === "scanning" && (
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="text-[9px] text-muted-foreground"
                      >
                        A procurar...
                      </motion.span>
                    )}
                    {phase === "found" && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[9px] font-medium text-emerald-500">
                        Vaga encontrada!
                      </motion.span>
                    )}
                    {phase === "confirmed" && (
                      <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-0.5 text-[9px] font-medium text-emerald-500">
                        <Check className="h-2.5 w-2.5" /> Agendado
                      </motion.span>
                    )}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid gap-px" style={{ gridTemplateColumns: "32px repeat(5, 1fr)" }}>
                    <div />
                    {DAYS.map((d, i) => (
                      <div key={d} className={`py-0.5 text-center text-[8px] font-semibold uppercase ${
                        i === 3 && phase !== "scanning" ? "text-primary" : "text-muted-foreground"
                      }`}>{d}</div>
                    ))}
                    {HOURS.map((hour, hIdx) => (
                      <div key={hour} className="contents">
                        <div className="flex items-center justify-end pr-1 text-[8px] text-muted-foreground">{hour}</div>
                        {DAYS.map((_, dIdx) => {
                          const slot = BOOKED.find((s) => s.day === dIdx && hIdx >= s.hour && hIdx < s.hour + s.span)
                          const isTarget = dIdx === 3 && hIdx === 1
                          const isSlotStart = slot && hIdx === slot.hour

                          if (slot && !isSlotStart) return <div key={dIdx} />
                          if (slot && isSlotStart) {
                            return (
                              <div key={dIdx} className="rounded bg-muted/50 px-0.5 py-px text-[7px] text-muted-foreground"
                                style={{ gridRow: `span ${slot.span}` }}>{slot.label}</div>
                            )
                          }
                          if (isTarget) {
                            return (
                              <motion.div key={dIdx}
                                animate={
                                  phase === "scanning"
                                    ? { backgroundColor: ["rgba(168,85,247,0)", "rgba(168,85,247,0.15)", "rgba(168,85,247,0)"] }
                                    : phase === "found"
                                      ? { backgroundColor: "rgba(168,85,247,0.2)", borderColor: "rgba(168,85,247,0.5)" }
                                      : { backgroundColor: "rgba(34,197,94,0.15)", borderColor: "rgba(34,197,94,0.5)" }
                                }
                                transition={phase === "scanning" ? { duration: 1.5, repeat: Infinity } : { duration: 0.4 }}
                                className={`flex items-center justify-center rounded border text-[7px] font-bold ${
                                  phase === "confirmed" ? "border-emerald-500/50 text-emerald-400"
                                    : phase === "found" ? "border-primary/50 text-primary"
                                      : "border-transparent text-primary/60"
                                }`}
                              >{phase !== "scanning" && "09-10h"}</motion.div>
                            )
                          }
                          return <div key={dIdx} className="rounded bg-muted/15" />
                        })}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Waveform bar generation ────────────────────────────────── */

function generateBars(count: number) {
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    const center = count / 2
    const dist = Math.abs(i - center) / center
    const base = 0.3 + (1 - dist) * 0.5
    bars.push(base * (0.15 + Math.random() * 0.85))
  }
  return bars
}

/* ─── Chat bubble ────────────────────────────────────────────── */

function ChatBubble({
  msg, voice, wordProgress,
}: {
  msg: { speaker: "assistant" | "customer"; text: string }
  voice: Voice
  wordProgress: number
}) {
  const isAssistant = msg.speaker === "assistant"
  const words = msg.text.split(/\s+/)
  const visibleCount = Math.min(wordProgress, words.length)
  const isTyping = visibleCount > 0 && visibleCount < words.length

  if (visibleCount <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isAssistant ? "rounded-tl-sm bg-primary/15 text-foreground"
          : "rounded-tr-sm bg-muted/60 text-foreground"
      }`}>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isAssistant ? voice.name : voice.customer}
        </p>
        <span className="inline whitespace-pre-wrap">
          {words.slice(0, visibleCount).map((word, i) => (
            <Fragment key={i}>
              <motion.span
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0 0 0)" }}
                transition={{ duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="inline-block"
              >
                {word}
              </motion.span>
              {i < visibleCount - 1 ? " " : ""}
            </Fragment>
          ))}
        </span>
        {isTyping && (
          <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle" />
        )}
      </div>
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */

export function VoiceDemo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: "-80px" })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const hasPausedForAgendaRef = useRef(false)

  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [dashPhase, setDashPhase] = useState<DashPhase>("hidden")

  const bars = useMemo(() => generateBars(BAR_COUNT), [])

  const totalWords = useMemo(
    () => selectedVoice.conversation.reduce((s, m) => s + wordCount(m.text), 0),
    [selectedVoice],
  )

  const revealedWords = Math.min(totalWords, Math.floor(progress * totalWords * 1.15))

  const msgWordProgress = useMemo(() => {
    const result: number[] = []
    let consumed = 0
    for (const msg of selectedVoice.conversation) {
      const wc = wordCount(msg.text)
      const remaining = revealedWords - consumed
      result.push(Math.max(0, Math.min(remaining, wc)))
      consumed += wc
    }
    return result
  }, [selectedVoice, revealedWords])

  const agendaMsgDone = msgWordProgress[AGENDA_MSG_INDEX] >= wordCount(selectedVoice.conversation[AGENDA_MSG_INDEX].text)
  const nextMsgStarted = msgWordProgress[AGENDA_MSG_INDEX + 1] > 0
  const confirmWords = msgWordProgress[AGENDA_MSG_INDEX + 3] ?? 0

  const [isPausedForAgenda, setIsPausedForAgenda] = useState(false)

  const wordsBeforeAgendaMsg = useMemo(() => {
    let n = 0
    for (let i = 0; i < AGENDA_MSG_INDEX; i++) {
      n += wordCount(selectedVoice.conversation[i].text)
    }
    return n
  }, [selectedVoice])
  const agendaMsgWordCount = wordCount(selectedVoice.conversation[AGENDA_MSG_INDEX].text)

  useEffect(() => {
    if (!showChat) return

    if (confirmWords > 2) {
      setDashPhase("confirmed")
    } else if (nextMsgStarted) {
      setDashPhase("found")
    } else if (agendaMsgDone) {
      setDashPhase((prev) => {
        if (prev === "hidden") return "overview"
        if (prev === "overview") return "overview"
        return prev
      })
    }
  }, [showChat, agendaMsgDone, nextMsgStarted, confirmWords])

  useEffect(() => {
    if (dashPhase === "overview") {
      const t = setTimeout(() => setDashPhase("navigating"), 800)
      return () => clearTimeout(t)
    }
    if (dashPhase === "navigating") {
      const t = setTimeout(() => setDashPhase("scanning"), 1200)
      return () => clearTimeout(t)
    }
  }, [dashPhase])

  useEffect(() => {
    if (chatEndRef.current && showChat) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [revealedWords, showChat, dashPhase])

  const stopAudio = useCallback(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
      pauseTimeoutRef.current = null
    }
    hasPausedForAgendaRef.current = false
    setIsPausedForAgenda(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    setPlaying(false)
  }, [])

  const fullReset = useCallback(() => {
    stopAudio()
    setProgress(0)
    setShowChat(false)
    setDashPhase("hidden")
  }, [stopAudio])

  useEffect(() => { return () => fullReset() }, [fullReset])

  function handlePlay() {
    if (playing) { stopAudio(); return }

    if (showChat) {
      fullReset()
    }

    hasPausedForAgendaRef.current = false
    const audio = new Audio(selectedVoice.file)
    audioRef.current = audio
    audio.play()
    setPlaying(true)
    setShowChat(true)
    setProgress(0)
    setDashPhase("hidden")

    if (timerRef.current) clearInterval(timerRef.current)
    const threshold = (wordsBeforeAgendaMsg + agendaMsgWordCount) / totalWords
    timerRef.current = setInterval(() => {
      if (hasPausedForAgendaRef.current) return
      if (audio.duration && audio.duration > 0) {
        const p = audio.currentTime / audio.duration
        setProgress(Math.min(p, 1))

        if (!hasPausedForAgendaRef.current && p >= threshold) {
          hasPausedForAgendaRef.current = true
          setIsPausedForAgenda(true)
          audio.pause()
          setDashPhase("overview")
          pauseTimeoutRef.current = setTimeout(() => {
            pauseTimeoutRef.current = null
            setIsPausedForAgenda(false)
            setDashPhase("found")
            hasPausedForAgendaRef.current = false
            audio.play()
          }, AGENDA_PAUSE_MS)
        }

        if (p >= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setProgress(1)
          setPlaying(false)
        }
      }
    }, 50)

    audio.onended = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      setProgress(1)
      setPlaying(false)
    }
  }

  function handleSelectVoice(voice: Voice) {
    if (voice.id !== selectedVoice.id) {
      fullReset()
      setSelectedVoice(voice)
    }
    setDropdownOpen(false)
  }

  const filledBars = Math.floor(progress * BAR_COUNT)
  const feminineVoices = VOICES.filter((v) => v.gender === "feminine")
  const masculineVoices = VOICES.filter((v) => v.gender === "masculine")

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div ref={sectionRef}
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
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent" />

            <div className="relative">
              {/* Header */}
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

                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50">
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
                            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vozes Femininas</p>
                            {feminineVoices.map((v) => (
                              <button key={v.id} onClick={() => handleSelectVoice(v)}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                                  selectedVoice.id === v.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                                }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${selectedVoice.id === v.id ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                {v.name}
                              </button>
                            ))}
                            <div className="my-1 h-px bg-border/50" />
                            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vozes Masculinas</p>
                            {masculineVoices.map((v) => (
                              <button key={v.id} onClick={() => handleSelectVoice(v)}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                                  selectedVoice.id === v.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                                }`}>
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
                <button onClick={handlePlay}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95">
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                </button>
                <div className="flex flex-1 items-center gap-[2px]">
                  {bars.map((height, i) => (
                    <div key={i} className="relative flex-1 overflow-hidden rounded-full"
                      style={{ height: `${Math.max(height * 40, 4)}px` }}>
                      <div className="absolute inset-0 rounded-full bg-muted-foreground/20" />
                      <motion.div className="absolute inset-0 rounded-full bg-primary"
                        initial={false}
                        animate={{ scaleX: i < filledBars ? 1 : 0, opacity: i < filledBars ? 1 : 0 }}
                        transition={{ duration: 0.05 }}
                        style={{ transformOrigin: "left" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-96 overflow-y-auto rounded-xl bg-muted/20 p-4 scrollbar-thin">
                      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Conversa em tempo real
                      </p>
                      <div className="space-y-3">
                        {selectedVoice.conversation.map((msg, i) => (
                          <div key={`${selectedVoice.id}-${i}`}>
                            <ChatBubble msg={msg} voice={selectedVoice} wordProgress={msgWordProgress[i]} />
                            {i === AGENDA_MSG_INDEX && dashPhase !== "hidden" && (
                              <MiniDashboard phase={dashPhase} />
                            )}
                          </div>
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
