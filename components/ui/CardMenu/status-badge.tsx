// components/ui/Badge/StatusBadge.tsx
import React from "react"

interface StatusBadgeProps {
  status: "Active" | "Inactive"
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      <span className={`mr-1.5 size-2 rounded-full ${status === "Active" ? "bg-green-500" : "bg-red-500"}`}></span>
      {status}
    </span>
  )
}

export default StatusBadge
