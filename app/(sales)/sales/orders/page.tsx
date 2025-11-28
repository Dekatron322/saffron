"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { useState } from "react"
import TransactionIcon from "public/transaction-icon"
import AccountIcon from "public/accounts-icon"
import WarningIcon from "public/warning-icon"
import CustomerIcon from "public/customer-icon"
import TotalOrderTable from "components/Tables/TotalOrderTable"
import PendingOrders from "components/Tables/PendingOrders"
import CompletedOrders from "components/Tables/CompletedOrders"
import CancelledOrders from "components/Tables/CancelledOrders"
import Link from "next/link"

const TableTabs = () => {
  const [activeTab, setActiveTab] = useState(1)

  const tabs = [
    { id: 1, label: "Total Orders", icon: <TransactionIcon /> },
    { id: 2, label: "Pending Orders", icon: <AccountIcon /> },
    { id: 3, label: "Completed Orders", icon: <WarningIcon /> },
    { id: 4, label: "Cancelled Orders", icon: <CustomerIcon /> },
  ]

  const renderTable = () => {
    switch (activeTab) {
      case 1:
        return <TotalOrderTable />
      case 2:
        return <PendingOrders />
      case 3:
        return <CompletedOrders />
      case 4:
        return <CancelledOrders />

      default:
        return <TotalOrderTable />
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "border-b-2 border-[#00a4a6] text-[#00a4a6]" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <Link
          href="/sales/orders/create-order"
          className="ml-auto items-center rounded-full border border-[#00a4a6] px-4 py-2 text-[#00a4a6]"
        >
          Create New Order
        </Link>
      </div>
      <div className="mt-4">{renderTable()}</div>
    </div>
  )
}

export default function Dashboard() {
  return (
    // <ProtectedRoute>
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col  max-sm:px-3 max-sm:py-4 md:my-8">
              <div className="w-full">
                <TableTabs />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    // </ProtectedRoute>
  )
}
