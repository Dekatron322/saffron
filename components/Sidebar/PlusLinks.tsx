"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BusinessLogo,
  ChatIcon,
  DashboardIcon,
  EmployeeLogo,
  NoteIcon,
  Pricing,
  ServiceIcon,
  SupportIcon,
  UtilityIcon,
} from "./Icons"
import SettingIcon from "public/setting-icon"

const links = [
  { name: "Dashboard", href: "/otech-plus/dashboard", icon: DashboardIcon },
  { name: "Transactions", href: "/otech-plus/transactions", icon: Pricing },
  { name: "Customers", href: "/otech-plus/customers", icon: ServiceIcon },
  //   { name: "Virtual Accounts", href: "/otech-plus/virtual-accounts", icon: NoteIcon },
  { name: "Businesses", href: "/otech-plus/businesses", icon: BusinessLogo },
  { name: "Employees", href: "/otech-plus/employee", icon: EmployeeLogo },
]

interface LinksProps {
  isCollapsed: boolean
}

export function PlusLinks({ isCollapsed }: LinksProps) {
  const pathname = usePathname()
  return (
    <div className="flex  flex-col border-black lg:h-auto">
      {links.map((link) => {
        const LinkIcon = link.icon
        const isActive = pathname.startsWith(link.href)
        return (
          <>
            <Link
              key={link.name}
              href={link.href}
              className={clsx("dashboard-style", {
                "active-dashboard": isActive,
              })}
            >
              <div className="flex items-center gap-2 pl-5">
                <LinkIcon isActive={isActive} />
                <p
                  className={clsx("text-sm font-semibold transition-opacity duration-500", {
                    hidden: isCollapsed,
                    "font-extrabold transition-opacity duration-500": isActive,
                  })}
                >
                  {link.name}
                </p>
              </div>
            </Link>
          </>
        )
      })}
    </div>
  )
}
