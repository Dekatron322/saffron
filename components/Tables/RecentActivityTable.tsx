"use client"

import React, { useEffect, useRef, useState } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import OutgoingIcon from "public/outgoing-icon"
import IncomingIcon from "public/incoming-icon"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import DeleteModal from "components/ui/Modal/delete-modal"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  orderId: string
  customer: string
  itemPurchased: string
  payment70: string
  orderStatus: string
  date: string
}

const RecentActivityTable = () => {
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
      orderId: "#ORD12345",
      customer: "Robert Fox",
      itemPurchased: "Paracetamol (2x)",
      payment70: "3,679,980",
      orderStatus: "Completed",
      date: "2024-12-19",
    },
    {
      sn: 2,
      orderId: "#ORD12346",
      customer: "Robert Lee",
      itemPurchased: "Ibuprofen",
      payment70: "3,679,980",
      orderStatus: "Completed",
      date: "2024-12-20",
    },
    {
      sn: 3,
      orderId: "#ORD12347",
      customer: "Robert Chang",
      itemPurchased: "Amoxicillin",
      payment70: "3,679,980",
      orderStatus: "Cancelled",
      date: "2024-12-20",
    },
    {
      sn: 4,
      orderId: "#ORD12348",
      customer: "Robert Lee",
      itemPurchased: "Insulin Pen (10x)",
      payment70: "3,679,980",
      orderStatus: "Reverted",
      date: "2024-12-20",
    },
    {
      sn: 5,
      orderId: "#ORD12349",
      customer: "Robert Lee",
      itemPurchased: "Vitamin D Supplements",
      payment70: "3,679,980",
      orderStatus: "Pending",
      date: "2024-12-20",
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

  // CONFIRM DELETE FROM MODAL
  const handleConfirmDelete = (reason: string) => {
    setDeleteLoading(true)
    // replace with real API call if needed
    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.orderId !== selectedOrder?.orderId))
      setDeleteLoading(false)
      setDeleteModalOpen(false)
    }, 800)
  }

  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-semibold md:text-2xl">Recent Activities</p>
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
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("orderId")}>
                    <div className="flex items-center gap-2">
                      Order ID <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("customer")}>
                    <div className="flex items-center gap-2">
                      Customer Name <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("itemPurchased")}>
                    <div className="flex items-center gap-2">
                      Item Purchased <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("payment70")}>
                    <div className="flex items-center gap-2">
                      Total Amount <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("orderStatus")}>
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("date")}>
                    <div className="flex items-center gap-2">
                      Date <RxCaretSort />
                    </div>
                  </th>
                  <th className="border-b p-4 text-sm">Action</th>
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
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.orderId}</div>
                    </td>
                    <td className="border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <img src="/DashboardImages/UserCircle.png" alt="" className="icon-style" />
                        <img src="/DashboardImages/UserCircle-dark.png" alt="" className="dark-icon-style" />
                        {order.customer}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.itemPurchased}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.payment70)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span className="text-grey-400">₹</span>
                          {order.payment70}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.orderStatus)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span className="size-2 rounded-full" style={dotStyle(order.orderStatus)} />
                          {order.orderStatus}
                        </div>
                      </div>
                    </td>
                    <td className="border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <img src="/DashboardImages/Calendar.png" alt="" />
                        {order.date}
                      </div>
                    </td>
                    <td className="relative border-b px-4 py-1 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleDropdown(idx)
                          }}
                          className="rounded p-1 hover:bg-gray-100"
                        >
                          <RxDotsVertical />
                        </button>
                        {activeDropdown === idx && (
                          <div
                            ref={(el) => {
                              dropdownRefs.current[idx] = el
                            }}
                            className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // your edit handler
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(order, idx)
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        businessName={selectedOrder?.orderId || ""}
      />
    </div>
  )
}

export default RecentActivityTable
