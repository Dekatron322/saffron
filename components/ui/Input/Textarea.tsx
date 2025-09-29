// components/Input/TextArea.tsx
import React from "react"

interface TextAreaProps {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
  className?: string
}

export const TextAreaModule: React.FC<TextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#00a4a6] focus:outline-none focus:ring-2 focus:ring-[#00a4a6]"
      />
    </div>
  )
}
