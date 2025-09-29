// TotalBusinesses.tsx
import React from "react"

export interface IconProps {
  className?: string
}

const TotalBusinesses: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="22" fill="#F5F8FA" />
      <path d="M19 27V21L17 23" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M19 21L21 23" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path
        d="M32 20V25C32 30 30 32 25 32H19C14 32 12 30 12 25V19C12 14 14 12 19 12H24"
        stroke="#292D32"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M32 20H28C25 20 24 19 24 16V12L32 20Z"
        stroke="#292D32"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export default TotalBusinesses
