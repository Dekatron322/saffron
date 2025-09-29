import React, { useEffect, useState } from "react"
import { Accounts, Maintenance, Occupancy } from "utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

interface PaymentAccount {
  id: number
  name: string
  balance: string
  status: string
}

interface Deposit {
  id: number
  name: string
  rate: string
  account_balance: string
  interest: string
  date: string
}

interface Credit {
  id: number
  name: string
  rate: string
  account_balance: string
  interest: string
  date: string
}

const DashboardMain: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("financial-metrics")
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false)
  const [selectedValue, setSelectedValue] = useState<string>("All")

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "income":
        return "text-[#179402]"
      case "expense":
        return "text-[#FF6A5A]"
      default:
        return "text-[#EEC202]"
    }
  }

  const getBgColor = (status: string): string => {
    switch (status) {
      case "income":
        return "bg-[#179402]"
      case "expense":
        return "bg-[#FF6A5A]"
      default:
        return "bg-[#EEC202]"
    }
  }

  const handlePaymentClick = (accountId: number) => {
    router.push(`/accounts/details/${accountId}`)
  }

  const handleDepositClick = (accountId: number) => {
    router.push(`/accounts/deposit/${accountId}`)
  }

  const handleDropdownToggle = () => {
    setDropdownVisible(!dropdownVisible)
  }

  const handleValueSelect = (value: string) => {
    setSelectedValue(value)
    setDropdownVisible(false)
  }

  const renderFinancialMetrics = () => {
    return (
      <div className="h-auto w-full bg-[#ffffff] px-10 max-sm:px-4">
        <div className="my-7 flex w-full items-center justify-between">
          <h5 className="text-[28px] font-medium max-sm:text-lg">Financial Metrics</h5>
          <div className="relative max-sm:hidden">
            <div className="flex">
              <div className="rounded-s-md bg-[#044982] p-2">
                <p className="text-sm text-white">Specific</p>
              </div>
              <div className="flex cursor-pointer gap-2 rounded-r-md bg-white p-2" onClick={handleDropdownToggle}>
                <p className="text-sm text-[#707070]">{selectedValue}</p>
                <KeyboardArrowDownIcon className="text-[#707070]" />
              </div>
            </div>
            {dropdownVisible && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {["All", "Rent", "Water", "Power", "Service"].map((option) => (
                    <p
                      key={option}
                      className="block cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => handleValueSelect(option)}
                    >
                      {option}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ">
            <p className="opacity-50 max-sm:text-sm">AMD </p>
            <KeyboardArrowRightIcon className="opacity-50" />
            <p className="opacity-50 max-sm:text-sm">Dashboard</p>
          </div>
        </div>
        <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2">
          {Accounts.map((account: PaymentAccount, index: number) => (
            <div key={account.id} className="flex w-full cursor-pointer gap-2">
              <div
                onClick={() => handlePaymentClick(account.id)}
                className="small-card  rounded-md p-2 transition duration-500 hover:border-none hover:shadow-xl md:border"
              >
                <div className="mb-[19px] flex items-start justify-between max-sm:mb-2">
                  <div className="mb-4 max-sm:mb-1">
                    <h5 className="font-semibold text-[#044982]">{account.name}</h5>
                  </div>
                  <Image src="/Icons/Graph-green.svg" width={24} height={24} alt="" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h5 className={`text-xl font-bold max-sm:text-lg ${getStatusColor(account.status)}`}>
                      {account.balance}
                    </h5>
                  </div>
                </div>
                <div className="my-5 h-[1px] w-full bg-black opacity-5 max-sm:my-2"></div>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex w-[72px] items-center justify-center rounded-md px-1 py-1 ${getBgColor(
                      account.status
                    )}`}
                  >
                    {account.status === "income" ? (
                      <ArrowDropUpIcon className="text-white" />
                    ) : (
                      <ArrowDropDownIcon className="text-white" />
                    )}
                    <p className="text-base font-medium text-white">2.4%</p>
                  </div>
                  <p className="text-[#707070] max-sm:text-xs">From previous period</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Add the chart component here */}
      </div>
    )
  }

  const renderOccupancyRate = () => {
    return (
      <div className="h-auto w-full bg-[#F7F7F9] px-10 max-sm:px-4">
        <div className="my-7 flex items-center justify-between">
          <h5 className="text-[28px] font-medium max-sm:text-lg">Occupancy Rate</h5>
          <div className="relative"></div>
          <div className="flex items-center gap-2 ">
            <p className="opacity-50 max-sm:text-sm">AMD </p>
            <KeyboardArrowRightIcon className="opacity-50" />
            <p className="opacity-50 max-sm:text-sm">Dashboard</p>
          </div>
        </div>
        <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2">
          {Occupancy.map((account: PaymentAccount, index: number) => (
            <div key={account.id} className="flex w-full cursor-pointer gap-2">
              <div
                onClick={() => handlePaymentClick(account.id)}
                className={`small-card rounded-md p-2 transition duration-500 hover:border-none hover:shadow-xl md:border ${
                  index === 0 ? "border-none shadow-2xl" : ""
                }`}
              >
                <div className="mb-[19px] flex items-start justify-between max-sm:mb-2">
                  <div className="mb-4 max-sm:mb-1">
                    <h5 className="font-semibold text-[#044982]">{account.name}</h5>
                  </div>
                  <Image src="/Icons/Graph1.svg" width={24} height={24} alt="" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h5 className={`text-xl font-bold max-sm:text-lg ${getStatusColor(account.status)}`}>
                      {account.balance}
                    </h5>
                  </div>
                </div>
                <div className="my-5 h-[1px] w-full bg-black opacity-5 max-sm:my-2"></div>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex w-[72px] items-center justify-center rounded-md px-1 py-1 ${getBgColor(
                      account.status
                    )}`}
                  >
                    {account.status === "income" ? (
                      <ArrowDropUpIcon className="text-white" />
                    ) : (
                      <ArrowDropDownIcon className="text-white" />
                    )}
                    <p className="text-base font-medium text-white">2.4%</p>
                  </div>
                  <p className="text-[#707070] max-sm:text-xs">From previous period</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Add the chart component here */}
      </div>
    )
  }

  const renderMaintenanceStatus = () => {
    return (
      <div className="h-auto w-full bg-[#F7F7F9] px-10 max-sm:px-4">
        <div className="my-7 flex items-center justify-between">
          <h5 className="text-[28px] font-medium max-sm:text-lg">Occupancy Rate</h5>
          <div className="relative"></div>
          <div className="flex items-center gap-2 ">
            <p className="opacity-50 max-sm:text-sm">AMD </p>
            <KeyboardArrowRightIcon className="opacity-50" />
            <p className="opacity-50 max-sm:text-sm">Dashboard</p>
          </div>
        </div>
        <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2">
          {Maintenance.map((account: PaymentAccount, index: number) => (
            <div key={account.id} className="flex w-full cursor-pointer gap-2">
              <div
                onClick={() => handlePaymentClick(account.id)}
                className={`small-card rounded-md p-2 transition duration-500 hover:border-none hover:shadow-xl md:border ${
                  index === 0 ? "border-none shadow-2xl" : ""
                }`}
              >
                <div className="mb-[19px] flex items-start justify-between max-sm:mb-2">
                  <div className="mb-4 max-sm:mb-1">
                    <h5 className="font-semibold text-[#044982]">{account.name}</h5>
                  </div>
                  <Image src="/Icons/Graph1.svg" width={24} height={24} alt="" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h5 className={`text-xl font-bold max-sm:text-lg ${getStatusColor(account.status)}`}>
                      {account.balance}
                    </h5>
                  </div>
                </div>
                <div className="my-5 h-[1px] w-full bg-black opacity-5 max-sm:my-2"></div>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex w-[72px] items-center justify-center rounded-md px-1 py-1 ${getBgColor(
                      account.status
                    )}`}
                  >
                    {account.status === "income" ? (
                      <ArrowDropUpIcon className="text-white" />
                    ) : (
                      <ArrowDropDownIcon className="text-white" />
                    )}
                    <p className="text-base font-medium text-white">2.4%</p>
                  </div>
                  <p className="text-[#707070] max-sm:text-xs">From previous period</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Add the chart component here */}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      <div className="tab-bg  flex w-[345px] items-center gap-3 p-1   max-sm:w-full ">
        <button
          className={`${activeTab === "financial-metrics" ? "active-tab" : "inactive-tab"}`}
          onClick={() => setActiveTab("financial-metrics")}
        >
          Financial Metrics
        </button>
        <button
          className={`${activeTab === "occupancy-rate" ? "active-tab" : "inactive-tab"}`}
          onClick={() => setActiveTab("occupancy-rate")}
        >
          Occupancy Rate
        </button>

        <button
          className={`${activeTab === "maitenance-status" ? "active-tab" : "inactive-tab"}`}
          onClick={() => setActiveTab("maitenance-status")}
        >
          Maintenance Status
        </button>
      </div>
      {activeTab === "financial-metrics" ? renderFinancialMetrics() : null}
      {activeTab === "occupancy-rate" ? renderOccupancyRate() : null}
      {activeTab === "maitenance-status" ? renderMaintenanceStatus() : null}
    </div>
  )
}

export default DashboardMain
