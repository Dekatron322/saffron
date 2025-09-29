// PasswordInputModule.tsx
"use client"
import React, { useState } from "react"
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined"
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri"

interface PasswordInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  error?: boolean
}

export const PasswordInputModule: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  className = "",
  error = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <div className={`mb-3 ${className}`}>
      <label className="mb-1 block text-sm text-[#2a2f4b]">{label}</label>
      <div
        className={`
        flex h-[46px] items-center rounded-md border px-3
        py-2 ${error ? "border-[#D14343]" : "border-[#E0E0E0]"}
        ${isFocused ? "bg-[#FBFAFC] ring-2 ring-[#00a4a6]" : "bg-white"}
        transition-all duration-200
      `}
      >
        <input
          type={isPasswordVisible ? "text" : "password"}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base outline-none"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button type="button" className="ml-2 rounded-full p-1   focus:outline-none" onClick={togglePasswordVisibility}>
          {isPasswordVisible ? <RiEye2Line /> : <RiEyeCloseLine />}
        </button>
      </div>
    </div>
  )
}
