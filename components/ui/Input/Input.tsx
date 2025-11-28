// FormInputModule.tsx
"use client"
import React, { useState } from "react"

interface FormInputProps {
  label: string
  type: string
  name?: string
  placeholder: string
  value: any

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export const FormInputModule: React.FC<FormInputProps> = ({
  label,
  type,
  placeholder,
  value,
  name,
  onChange,
  className = "",
  disabled = false,
  error = false,
  helperText,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={` ${className}`}>
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
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent text-base outline-none"
          value={value}
          name={name}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
        />
      </div>
      {helperText && <p className={`mt-1 text-xs ${error ? "text-[#D14343]" : "text-gray-500"}`}>{helperText}</p>}
    </div>
  )
}
