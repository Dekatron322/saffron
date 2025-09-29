"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import RefundDetial from "components/SalesReport/RefundDetial"
import ArrowForwardIcon from "public/arrow-forward-icon"

export default function Dashboard() {
  return (
    // <ProtectedRoute>
    <section className="h-auto w-full bg-[#F4F9F8]">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="flex flex-col">
            <div className="max-sm-my-4 flex w-full flex-col gap-6 px-8  max-sm:px-3 max-sm:py-4 md:my-8">
              <div className="flex items-center gap-2">
                <p className="text-[#94A3B8]">Sales</p>
                <ArrowForwardIcon />
                <p>Transaction Details</p>
              </div>
              <div className="w-full">
                <RefundDetial />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    // </ProtectedRoute>
  )
}
