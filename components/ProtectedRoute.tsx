"use client"

import { selectAuth } from "app/api/store/authSlice"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSelector } from "react-redux"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useSelector(selectAuth)

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      router.push("/signin")
    }
  }, [isAuthenticated, router])

  return <>{children}</>
}
