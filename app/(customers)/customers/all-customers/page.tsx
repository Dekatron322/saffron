// src/app/order-creation/page.tsx
"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useDispatch } from "react-redux"
import CustomersTab from "components/ui/Tab/CustomerTab"
import SuppliersTab from "components/ui/Tab/SuppliersTab"
import SubscriptionsTab from "components/ui/Tab/SubscriptionsTab"

const OrderCreation = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers" | "subscriptions">("customers")

  return (
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col items-start">
            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col max-sm:px-3 max-sm:py-4 md:my-8">
              <div className="w-full">
                {/* Tabs */}
                <div className="mb-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("customers")}
                      className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                        activeTab === "customers"
                          ? "border-[#00a4a6] text-[#00a4a6]"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      Customers
                    </button>
                    <button
                      onClick={() => setActiveTab("suppliers")}
                      className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                        activeTab === "suppliers"
                          ? "border-[#00a4a6] text-[#00a4a6]"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      Suppliers
                    </button>
                    <button
                      onClick={() => setActiveTab("subscriptions")}
                      className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                        activeTab === "subscriptions"
                          ? "border-[#00a4a6] text-[#00a4a6]"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      Subscriptions
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "customers" && <CustomersTab />}
                {activeTab === "suppliers" && <SuppliersTab />}
                {activeTab === "subscriptions" && <SubscriptionsTab />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderCreation
