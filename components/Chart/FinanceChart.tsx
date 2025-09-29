import React, { useState } from "react"

const FinanceChart = () => {
  const [activeTab, setActiveTab] = useState("revenue")

  return (
    <div className="flex gap-6">
      {/* Main Trends Section */}
      <div className="flex-3 flex w-3/4 rounded-md border p-5">
        <div className="w-full flex-col">
          {/* Tabs Header */}
          <div className="flex w-full items-center gap-5 border-b">
            <p className="bottom-bar text-2xl">Trends</p>

            <div
              className={`flex cursor-pointer items-center gap-1 ${
                activeTab === "revenue" ? "border-b-2 border-black px-3 pb-1 font-semibold text-black" : ""
              }`}
              onClick={() => setActiveTab("revenue")}
            >
              <img src="/DashboardImages/List.png" alt="" className="icon-style" />
              <img src="/DashboardImages/List-light.png" alt="" className="dark-icon-style" />
              <p className="bottom-bar">Revenue Trends</p>
            </div>

            <div
              className={`flex cursor-pointer items-center gap-1 ${
                activeTab === "preorder" ? "border-b-2 border-black px-3 pb-1 font-semibold text-black" : ""
              }`}
              onClick={() => setActiveTab("preorder")}
            >
              <img src="/DashboardImages/List.png" alt="" className="icon-style" />
              <img src="/DashboardImages/List-light.png" alt="" className="dark-icon-style" />
              <p className="">Pre-order Trends</p>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="mt-4">
            {activeTab === "preorder" && <img src="/images/Vector 367.svg" alt="Pre-order Trends Chart" />}
          </div>
        </div>
      </div>

      {/* Secondary Section */}
      <div className="flex w-1/4 flex-col justify-between rounded-md border bg-white  p-5">
        <p className="text-xl font-medium">Model Popularity</p>

        <div>
          <p className="text-center font-medium">Insight</p>
          <div className="bottom-style mt-1 flex items-center justify-center rounded-[4px] border py-2">
            <p className="text-center text-xs">
              Altima Core is the top <br />
              choice among customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceChart
