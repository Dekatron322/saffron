"use client"
import "styles/tailwind.css"
import ThemeProviders from "components/ProvidersComponents/ThemeProviders"
import ReduxProvider from "./api/providers/ReduxProvider"
import { useAppDispatch } from "./api/store/store"
import { useEffect } from "react"
import { initializeAuth } from "./api/store/authSlice"

// Create a client component that wraps the children with ThemeProviders
function ClientContent({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  return <ThemeProviders>{children}</ThemeProviders>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ClientContent>{children}</ClientContent>
        </ReduxProvider>
      </body>
    </html>
  )
}
