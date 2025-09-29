"use client"

import React, { useState, useRef, useEffect } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import OutgoingIcon from "public/outgoing-icon"
import IncomingIcon from "public/incoming-icon"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import { getBankLogo } from "components/ui/BanksLogo/bank-logo"
import EmptyState from "public/empty-state"
import DeleteModal from "components/ui/Modal/delete-modal"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  customer: string
  totalPurchase: string
  purchaseFreq: string
  preferredCat: string
  lifetimeValue: string
  discountEligibity: string
  referalSource: string
}

const CustomerTrends = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null) {
        const dropdownElement = dropdownRefs.current[activeDropdown]
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setActiveDropdown(null)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  const [orders, setOrders] = useState<Order[]>([
    {
      sn: 1,
      customer: "Robert Fox",
      totalPurchase: "12",
      purchaseFreq: "120",
      lifetimeValue: "1,200",
      preferredCat: "Prescription Drugs",
      discountEligibity: "Yes",
      referalSource: "Dr. Adams Clinic",
    },
    {
      sn: 2,

      customer: "Alex  Johnson",
      totalPurchase: "15",
      purchaseFreq: "2000",
      lifetimeValue: "1,500",
      preferredCat: "Wellness Products",
      discountEligibity: "Yes",
      referalSource: "Wall In",
    },
    {
      sn: 3,

      customer: "Sarah Brown",
      totalPurchase: "10",
      purchaseFreq: "3000",
      lifetimeValue: "950",
      preferredCat: "General Products",
      discountEligibity: "Yes",
      referalSource: "Dr. Bennet Referral",
    },
  ])

  const getPaymentStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "Paid":
      case "Completed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Pending":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Not Paid":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "Reverted":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      case "Cancelled":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }

  const dotStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "Paid":
      case "Completed":
        return { backgroundColor: "#589E67" }
      case "Pending":
        return { backgroundColor: "#D28E3D" }
      case "Not Paid":
      case "Cancelled":
        return { backgroundColor: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#4976F4" }
      case "Reverted":
        return { backgroundColor: "#954BAF" }
      default:
        return {}
    }
  }

  const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "Outgoing":
        return <OutgoingIcon className="size-2 rounded-full" />
      case "Incoming":
        return <IncomingIcon className="size-2 rounded-full" />
      default:
        return <span className="size-2 rounded-full" />
    }
  }

  // SORTING
  const toggleSort = (column: keyof Order) => {
    const isAsc = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAsc ? "desc" : "asc")
    setSortColumn(column)
    const sorted = [...orders].sort((a, b) =>
      a[column] < b[column] ? (isAsc ? 1 : -1) : a[column] > b[column] ? (isAsc ? -1 : 1) : 0
    )
    setOrders(sorted)
  }

  // SEARCH
  const handleCancelSearch = () => setSearchText("")

  // PAGINATION
  const filteredOrders = orders.filter((order) =>
    Object.values(order).some((val) => val != null && String(val).toLowerCase().includes(searchText.toLowerCase()))
  )
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast)
  const paginate = (num: number) => setCurrentPage(num)

  // DROPDOWN
  const toggleDropdown = (idx: number) => setActiveDropdown(activeDropdown === idx ? null : idx)

  // OPEN DELETE MODAL
  const handleDeleteClick = (order: Order, idx: number) => {
    setSelectedOrder(order)
    setDeleteReason("")
    setDeleteModalOpen(true)
    setActiveDropdown(null)
  }

  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-semibold md:text-2xl">Customer Trends</p>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />

          <ButtonModule
            variant="black"
            size="md"
            icon={<ExportIcon />}
            iconPosition="end"
            onClick={() => alert("Export clicked")}
          >
            <p className="max-sm:hidden">Export</p>
          </ButtonModule>
          <ButtonModule type="submit" variant="outline" size="md">
            View
          </ButtonModule>
        </div>
      </div>

      {/* Error / Empty */}
      {error ? (
        <div className="flex h-60 flex-col items-center justify-center bg-[#F4F9F8]">
          <EmptyState />
          <p className="mt-2 text-xl font-bold text-[#D82E2E]">Failed to load recent activities.</p>
          <p>Please refresh or try again later.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center bg-[#F4F9F8]">
          <EmptyState />
          <p className="mt-2 text-base font-bold text-[#202B3C]">No Activity found.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="w-full overflow-x-auto border-x">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#F4F9F8]">
                  <th
                    className="flex cursor-pointer items-center gap-2 border-b p-4 text-sm"
                    onClick={() => toggleSort("sn")}
                  >
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    SN <RxCaretSort />
                  </th>

                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("customer")}>
                    <div className="flex items-center gap-2">
                      Customer Name <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("totalPurchase")}>
                    <div className="flex items-center gap-2">
                      Total Purchased <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("purchaseFreq")}>
                    <div className="flex items-center gap-2">
                      Purchase Frequency <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("preferredCat")}>
                    <div className="flex items-center gap-2">
                      Prefered Category <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("lifetimeValue")}>
                    <div className="flex items-center gap-2">
                      Prefered Category <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("discountEligibity")}>
                    <div className="flex items-center gap-2">
                      Discount Eligibity <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("referalSource")}>
                    <div className="flex items-center gap-2">
                      Referral Source <RxCaretSort />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, idx) => (
                  <tr key={idx}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                        {order.sn}
                      </div>
                    </td>

                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <img src="/DashboardImages/UserCircle.png" alt="" className="icon-style" />
                        <img src="/DashboardImages/UserCircle-dark.png" alt="" className="dark-icon-style" />
                        {order.customer}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.totalPurchase}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.purchaseFreq)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          {order.purchaseFreq}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.preferredCat)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          {order.preferredCat}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.lifetimeValue)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span className="size-2 rounded-full" style={dotStyle(order.lifetimeValue)} />
                          {order.lifetimeValue}
                        </div>
                      </div>
                    </td>
                    <td className="border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">{order.discountEligibity}</div>
                    </td>
                    <td className="border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">{order.referalSource}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredOrders.length)} of {filteredOrders.length}{" "}
              entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`rounded-full px-2 py-1 ${
                  currentPage === 1 ? "cursor-not-allowed bg-gray-200 text-gray-500" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdOutlineArrowBackIosNew />
              </button>
              {Array.from({
                length: Math.ceil(filteredOrders.length / itemsPerPage),
              }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`rounded-full px-3 py-1 ${
                    currentPage === i + 1 ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                className={`rounded-full px-2 py-1 ${
                  currentPage === Math.ceil(filteredOrders.length / itemsPerPage)
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdOutlineArrowForwardIos />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
    </div>
  )
}

export default CustomerTrends
