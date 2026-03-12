"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Phone, Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Phone className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">RecepCall</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#recursos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Recursos
          </Link>
          <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Como Funciona
          </Link>
          <Link href="#precos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Preços
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/sign-up">Começar Grátis</Link>
          </Button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 px-4 py-4">
            <Link href="#recursos" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Recursos
            </Link>
            <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Como Funciona
            </Link>
            <Link href="#precos" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Preços
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
