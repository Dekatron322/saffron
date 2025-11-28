"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { Links } from "./Links"
import { CollapsedLogoIcon, LogoIcon, SettingsIcon } from "./Icons"
import clsx from "clsx"
import LogoutIcon from "public/logout-icon"
import { BsFillPinFill, BsPin } from "react-icons/bs"

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [pinned, setPinned] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebarPinned")
      const isPinned = saved === "true"
      setPinned(isPinned)
      // If pinned, ensure it's expanded on load
      if (isPinned) {
        setIsCollapsed(false)
      } else {
        setIsCollapsed(true)
      }
    } catch (e) {
      // If localStorage is unavailable, default to collapsed
      setIsCollapsed(true)
    }
  }, [])

  return (
    <div
      onMouseEnter={() => !pinned && setIsCollapsed(false)}
      onMouseLeave={() => !pinned && setIsCollapsed(true)}
      className={clsx("sidebar relative flex h-full flex-col justify-between border-r border-[#E4E4E4] max-sm:hidden", {
        "w-20": isCollapsed,
        "w-64": !isCollapsed,
      })}
    >
      {/* Pin/Unpin Button - Positioned halfway in/out of sidebar border */}
      <div
        className={clsx("absolute -right-3 top-8 z-50 transition-all duration-200", {
          "opacity-100": !isCollapsed,
          "opacity-0": isCollapsed,
        })}
      >
        <button
          onClick={() => {
            const next = !pinned
            setPinned(next)
            try {
              localStorage.setItem("sidebarPinned", String(next))
            } catch {}
            if (next) {
              setIsCollapsed(false)
            }
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-[#E4E4E4] bg-white text-[#747A80] shadow-sm hover:bg-gray-50 hover:shadow-md"
          title={pinned ? "Unpin sidebar" : "Pin sidebar"}
        >
          {pinned ? <BsFillPinFill /> : <BsPin />}
        </button>
      </div>

      <div className="h-full justify-between border-0 border-red-700 lg:mt-2 ">
        <div className="flex items-center justify-between border-[#E4E4E4] px-7 pb-3 transition-opacity">
          <Link href="/">{isCollapsed ? <CollapsedLogoIcon /> : <LogoIcon />}</Link>
        </div>

        <div className="mb-2 h-full border-[#E4E4E4] px-2 lg:space-y-1">
          <Links isCollapsed={isCollapsed} />
        </div>
      </div>
      <div className="my-4 h-auto items-center justify-between border-t px-6">
        <div className="flex items-center space-x-2 border-0 pt-5 text-[#747A80]">
          <SettingsIcon />
          {!isCollapsed && <p className="bottom-bar hidden text-xs font-semibold lg:block 2xl:text-base">Settings</p>}
        </div>
        <div className="flex items-center space-x-2 border-0 pt-5 text-[#747A80]">
          <LogoutIcon />
          {!isCollapsed && <p className="bottom-bar hidden text-xs font-semibold lg:block 2xl:text-base">Logout</p>}
        </div>
      </div>
    </div>
  )
}

export default SideBar
