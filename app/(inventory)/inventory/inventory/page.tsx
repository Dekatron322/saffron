"use client"
import DashboardNav from "components/Navbar/DashboardNav"
import AllTransactionstable from "components/Tables/AllTransactionstable"
import InventoryTable from "components/Tables/InventoryTable"
import React from "react"

export default function Inventory() {
  return (
    // <ProtectedRoute>
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col  max-sm:px-3 max-sm:py-4 md:my-8">
              <div className="w-full">
                <InventoryTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    // </ProtectedRoute>
  )
}
