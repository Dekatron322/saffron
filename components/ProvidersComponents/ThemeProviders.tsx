"use client"
import React, { useEffect, useState } from "react"
import { ThemeProvider } from "next-themes"

interface ThemeProvidersProps {
  children: React.ReactNode
}

export default function ThemeProviders({ children }: ThemeProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeProvider>{children}</ThemeProvider>
}
