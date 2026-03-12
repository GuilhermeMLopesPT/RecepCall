"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { motion, useInView } from "framer-motion"
import { Play, Pause, Phone } from "lucide-react"

const BAR_COUNT = 48
const DEMO_TEXT =
  "Olá, bom dia! Está a ligar para a nossa empresa. Em que posso ajudar? Se pretender agendar uma consulta, posso verificar a disponibilidade agora mesmo."

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

export function VoiceDemo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: "-80px" })
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [useAudioFile, setUseAudioFile] = useState(false)

  const bars = useMemo(() => generateBars(BAR_COUNT), [])

  const estimatedDuration = 8000

  const stopPlayback = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlaying(false)
    setProgress(0)
  }, [])

  useEffect(() => {
    const audio = new Audio("/demo-voice.mp3")
    audioRef.current = audio

    audio.addEventListener("canplaythrough", () => setUseAudioFile(true))
    audio.addEventListener("error", () => setUseAudioFile(false))
    audio.load()

    return () => {
      stopPlayback()
      audio.removeAttribute("src")
    }
  }, [stopPlayback])

  function playWithAudioFile() {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    audio.play()
    setPlaying(true)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (audio.duration) {
        const p = audio.currentTime / audio.duration
        setProgress(p)
        if (p >= 1) {
          setPlaying(false)
          setProgress(0)
          if (timerRef.current) clearInterval(timerRef.current)
        }
      }
    }, 50)

    audio.onended = () => {
      setPlaying(false)
      setProgress(0)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function playWithSpeechSynthesis() {
    const utterance = new SpeechSynthesisUtterance(DEMO_TEXT)
    utterance.lang = "pt-PT"
    utterance.rate = 0.95
    utterance.pitch = 1.0

    const voices = speechSynthesis.getVoices()
    const ptVoice = voices.find(
      (v) => v.lang.startsWith("pt") && v.name.toLowerCase().includes("female"),
    ) ?? voices.find((v) => v.lang.startsWith("pt"))
    if (ptVoice) utterance.voice = ptVoice

    utteranceRef.current = utterance
    setPlaying(true)

    const startTime = Date.now()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress(Math.min(elapsed / estimatedDuration, 0.98))
    }, 50)

    utterance.onend = () => {
      setPlaying(false)
      setProgress(0)
      if (timerRef.current) clearInterval(timerRef.current)
    }

    speechSynthesis.speak(utterance)
  }

  function handleToggle() {
    if (playing) {
      stopPlayback()
      return
    }
    if (useAudioFile) {
      playWithAudioFile()
    } else {
      playWithSpeechSynthesis()
    }
  }

  const filledBars = Math.floor(progress * BAR_COUNT)

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
            Assim é que os seus clientes são recebidos quando ligam. Natural, profissional e instantâneo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

            <div className="relative">
              {/* Top label */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Assistente RecepCall</p>
                  <p className="text-xs text-muted-foreground">Demonstração de voz IA</p>
                </div>
              </div>

              {/* Player */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggle}
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

              {/* Transcript */}
              <div className="mt-5 rounded-xl bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Transcrição
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  &ldquo;{DEMO_TEXT}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
