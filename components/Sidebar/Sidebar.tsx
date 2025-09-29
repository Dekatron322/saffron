"use client"
import Link from "next/link"
import React, { useState } from "react"
import { Links } from "./Links"
import { CollapsedLogoIcon, LogoIcon, SettingsIcon } from "./Icons"

import clsx from "clsx"
import LogoutIcon from "public/logout-icon"

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={clsx("sidebar flex h-full flex-col justify-between border-r border-[#E4E4E4] max-sm:hidden", {
        "w-20": isCollapsed,
        "w-64": !isCollapsed,
      })}
    >
      <div className="h-full justify-between border-0 border-red-700 lg:mt-2 ">
        <div className=" border-[#E4E4E4] px-7 pb-3 transition-opacity lg:block">
          <Link href="/">{isCollapsed ? <CollapsedLogoIcon /> : <LogoIcon />}</Link>
        </div>

        <div className="mb-2 h-full   border-[#E4E4E4] px-2  lg:space-y-1">
          <Links isCollapsed={isCollapsed} />
        </div>
      </div>
      <div className="my-4  h-auto items-center justify-between border-t px-6">
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
