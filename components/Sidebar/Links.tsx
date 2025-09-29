"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  AdminIcon,
  BusinessLogo,
  CustomerIcon,
  DashboardIcon,
  EmployeeLogo,
  FinanceIcon,
  GrowIcon,
  InventoryIcon,
  Pricing,
  PurchaseIcon,
  SalesIcon,
} from "./Icons"
import SettingIcon from "public/setting-icon"

const links = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  {
    name: "Inventory",
    href: "",
    icon: InventoryIcon,
    sublinks: [
      { name: "Inventory", href: "/inventory/inventory" },
      { name: "Product", href: "/inventory/product" },
      { name: "Category", href: "/inventory/category" },
      { name: "Units", href: "/inventory/units" },
    ],
  },
  {
    name: "Sales",
    href: "",
    icon: SalesIcon,

    sublinks: [
      { name: "Transactions", href: "/sales/transactions" },
      { name: "Order", href: "/sales/orders" },
    ],
  },
  { name: "Purchases", href: "/purchases", icon: PurchaseIcon },
  { name: "Customers", href: "/customers", icon: CustomerIcon },
  { name: "Finance", href: "/Finance", icon: FinanceIcon },
  { name: "Reports and Analysis", href: "/reports", icon: BusinessLogo },
  { name: "Grow Your Business", href: "/grow-your-business", icon: GrowIcon },
  { name: "User Management", href: "/user-management", icon: AdminIcon },
]

interface LinksProps {
  isCollapsed: boolean
}

export function Links({ isCollapsed }: LinksProps) {
  const pathname = usePathname()
  const [expandedLink, setExpandedLink] = useState<string | null>(null)

  const handleExpand = (linkName: string) => {
    setExpandedLink(expandedLink === linkName ? null : linkName)
  }

  return (
    <div className="flex flex-col border-black">
      {links.map((link) => {
        const LinkIcon = link.icon
        const hasSublinks = Array.isArray(link.sublinks) && link.sublinks.length > 0
        const isActive = link.href ? pathname.startsWith(link.href) : false
        const hasActiveSublink = hasSublinks && link.sublinks!.some((sublink) => pathname.startsWith(sublink.href))
        const isExpanded = expandedLink === link.name
        const isLinkActive = link.href ? isActive : hasActiveSublink

        // Determine border radius based on collapse and expand state
        const borderRadiusClass = isCollapsed
          ? "rounded-md"
          : hasSublinks
          ? isExpanded
            ? "rounded-md"
            : "rounded-md "
          : "rounded-md"

        return (
          <div key={link.name}>
            <div
              onClick={() => hasSublinks && handleExpand(link.name)}
              className={clsx("dashboard-style", borderRadiusClass, { "active-dashboard": isLinkActive })}
            >
              <Link href={link.href || "#"}>
                <div className="flex w-full items-center justify-between gap-2 pl-3">
                  <LinkIcon isActive={isLinkActive} />
                  <p
                    className={clsx("text-sm font-medium transition-opacity duration-500", {
                      hidden: isCollapsed,
                      "font-extrabold transition-opacity duration-500": isLinkActive,
                    })}
                  >
                    {link.name}
                  </p>
                  {hasSublinks && (
                    <img
                      src="/Icons/CaretDown.png"
                      className={clsx("mr-20 transition-transform duration-300", {
                        "rotate-180 transform": isExpanded,
                        hidden: isCollapsed,
                      })}
                      alt="Caret Icon"
                    />
                  )}
                </div>
              </Link>
            </div>
            {isExpanded && !isCollapsed && hasSublinks && (
              <div className="relative ml-9 ">
                {link.sublinks!.map((sublink) => {
                  const isSublinkActive = pathname.startsWith(sublink.href)
                  return (
                    <Link
                      key={sublink.name}
                      href={sublink.href}
                      className={clsx("dashboard-style2 block ", {
                        "active-dashboard2": isSublinkActive,
                      })}
                    >
                      <div className="flex items-center gap-2 pl-5">
                        <p
                          className={clsx("text-sm font-semibold", {
                            "font-extrabold": isSublinkActive,
                          })}
                        >
                          {sublink.name}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
