// components/ui/Loader.tsx
"use client"
import React from "react"

export const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-white" style={{ animationDelay: "0ms" }}></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-white" style={{ animationDelay: "150ms" }}></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-white" style={{ animationDelay: "300ms" }}></div>
    </div>
  )
}
