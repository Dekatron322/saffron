import Image from "next/image"
import React, { useEffect } from "react"

interface NotificationProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000) // Auto close after 3 seconds
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="animation-fade-in fixed bottom-4 m-5 flex h-[50px] w-[339px] transform items-center justify-center gap-2 rounded-md border border-[#1c232b] bg-[#92E3A9] text-[#1c232b] shadow-[#05420514] md:right-16">
      <span className="clash-font text-sm text-[#1c232b]"> {message}</span>
      <Image src="/AuthImages/Star2.svg" width={28.26} height={28.26} alt="dekalo" />
    </div>
  )
}

export default Notification
