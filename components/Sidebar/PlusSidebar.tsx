"use client"
import Link from "next/link"
import React, { useState } from "react"
import { Links } from "./Links"
import { CollapsedLogoIcon, LogoIcon } from "./Icons"

import clsx from "clsx"
import { PlusLinks } from "./PlusLinks"

const PlusSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(false)}
      className={clsx("sidebar flex h-full flex-col justify-between border-r border-[#E4E4E4] max-sm:hidden", {
        "w-20": isCollapsed,
        "w-64": !isCollapsed,
      })}
    >
      <div className="h-full justify-between border-0 border-red-700 lg:mt-6 lg:h-auto ">
        <div className="border-b border-[#E4E4E4] px-7 transition-opacity lg:block">
          <Link href="/">{isCollapsed ? <CollapsedLogoIcon /> : <LogoIcon />}</Link>
        </div>

        <div className="mb-2 h-full border-b border-[#E4E4E4] lg:h-auto lg:space-y-1">
          <PlusLinks isCollapsed={isCollapsed} />
        </div>
        {/* <div className="h-full border-b border-[#E4E4E4] lg:h-auto lg:space-y-1">
          <SecondLinks isCollapsed={isCollapsed} />
        </div> */}
      </div>
      <div className="my-4  flex h-auto items-center justify-between border-t  px-6">
        <div className="flex items-center space-x-2 border-0 border-black pt-5 text-[#747A80] ">
          <img src="/DashboardImages/Profile.png" />
          <p className="bottom-bar hidden text-xs font-semibold lg:block 2xl:text-base">Official Site</p>
        </div>
        <img src="/DashboardImages/CaretDoubleVertical.png" className="icon-style pt-5" />
        <img src="/DashboardImages/CaretDoubleVertical-dark.png" className="dark-icon-style pt-5" />
      </div>
    </div>
  )
}

export default PlusSidebar
