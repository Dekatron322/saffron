"use client"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"
import { FiSun } from "react-icons/fi"
import { IoMoonOutline } from "react-icons/io5"

const Footer = () => {
  const [isMoonIcon, setIsMoonIcon] = useState(true)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const toggleIcon = () => {
    setIsMoonIcon(!isMoonIcon)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  return (
    <div className="bg-primary fixed bottom-0 w-full px-7 py-4 max-sm:bottom-0 max-sm:right-0">
      <p className="text-center text-[#1c232b]">Otech Plus @2025 All Rights Reserved </p>
    </div>
  )
}

export default Footer
function setMounted(arg0: boolean) {
  throw new Error("Function not implemented.")
}
