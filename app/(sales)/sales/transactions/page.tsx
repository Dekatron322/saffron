"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useState } from "react"
import TransactionIcon from "public/transaction-icon"
import AccountIcon from "public/accounts-icon"
import WarningIcon from "public/warning-icon"
import CustomerIcon from "public/customer-icon"
import InsightIcon from "public/insight-icon"
import RecentActivityTable from "components/Tables/RecentActivityTable"
import AllTransactionTable from "components/Tables/AllTransactionstable"
import SalesReport from "components/SalesReport/SalesReport"
import TopSelling from "components/SalesReport/TopSelling"
import SalesAndRefund from "components/SalesReport/SalesAndRefund"
import InvoiceTable from "components/Tables/InvoiceTable"

const TableTabs = () => {
  const [activeTab, setActiveTab] = useState(1)

  const tabs = [
    { id: 1, label: "Sales Transactions", icon: <TransactionIcon /> },
    { id: 2, label: "Sales Reports", icon: <AccountIcon /> },
    { id: 3, label: "Top Selling", icon: <WarningIcon /> },
    { id: 4, label: "Sales Refund", icon: <CustomerIcon /> },
    { id: 5, label: "Invoices & Receipts", icon: <InsightIcon /> },
  ]

  const renderTable = () => {
    switch (activeTab) {
      case 1:
        return <AllTransactionTable />
      case 2:
        return <SalesReport />
      case 3:
        return <TopSelling />
      case 4:
        return <SalesAndRefund />
      case 5:
        return <InvoiceTable />
      default:
        return <RecentActivityTable />
    }
  }

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200">
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
