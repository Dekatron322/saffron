"use client"

import React from "react"
import { motion, type MotionProps } from "framer-motion"

type ButtonVariant = "primary" | "black" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends MotionProps {
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
  /** Optional icon element to render */
  icon?: React.ReactNode
  /** Position of the icon relative to the button text */
  iconPosition?: "start" | "end"
}

export const ButtonModule: React.FC<ButtonProps> = ({
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  children,
  icon,
  iconPosition = "start",
  ...motionProps
}) => {
  const baseClasses =
    "flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary: "bg-[#00a4a6] text-white hover:bg-[#07898c] focus:ring-[#00a4a6]",
    black: "bg-[#131319] text-white hover:bg-[#1c232b] focus:ring-[#131319]",
    secondary: "bg-[#e6f7f7] text-[#00a4a6] hover:bg-[#d0f0f0] focus:ring-[#00a4a6]",
    outline: "border border-[#00a4a6] text-[#00a4a6] hover:bg-[#e6f7f7] focus:ring-[#00a4a6]",
    ghost: "text-[#00a4a6] hover:bg-[#e6f7f7] focus:ring-[#00a4a6]",
    danger: "bg-[#e05c2a] text-white hover:bg-[#d95425] focus:ring-[#c44d1f]",
  }

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      {...motionProps}
    >
      {icon && iconPosition === "start" && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {children}
      {icon && iconPosition === "end" && <span className="ml-2 inline-flex items-center">{icon}</span>}
    </motion.button>
  )
}
