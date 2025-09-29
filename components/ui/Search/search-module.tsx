"use client"
import React from "react"
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"

interface SearchModuleProps {
  /** The current search text */
  value: string
  /** Handler for when the search text changes */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Optional callback when the cancel (clear) icon is clicked */
  onCancel?: () => void
  /** Placeholder text for the input */
  placeholder?: string
  /** Additional Tailwind or custom classes to apply */
  className?: string
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  value,
  onChange,
  onCancel,
  placeholder = "Search",
  className = "",
}) => {
  return (
    <div
      className={`flex h-[37px] w-full max-w-[380px] items-center justify-between gap-3 rounded-full border bg-[#F4F9F8] px-3 py-1 text-[#707070] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00a4a6] focus-within:ring-offset-2 hover:border-[#00a4a6] ${className}`}
    >
      <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
      <input
        type="text"
        id="search"
        placeholder={placeholder}
        className="h-[50px] w-full bg-transparent outline-none"
        value={value}
        onChange={onChange}
      />
      {value && onCancel && <RxCross2 onClick={onCancel} style={{ cursor: "pointer" }} />}
    </div>
  )
}
