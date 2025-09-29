// components/ui/Progress/ProgressBar.tsx
import React from "react"

interface ProgressBarProps {
  progress: number
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  )
}

export default ProgressBar
