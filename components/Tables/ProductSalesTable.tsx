"use client"

import React, { useState, useRef, useEffect } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import UpIcon from "public/Icons/up-icon"
import DownIcon from "public/Icons/down-icon"
import { useRouter } from "next/navigation"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  product: string
  category: string
  unitSold: string
  revenue: string
  percentage: string
}

const ProductSalesTable = () => {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      product: "Paracetamol 500mg",
      category: "Pharma Product",
      unitSold: "2,500",
      revenue: "7,500",
      percentage: "+18.00%",
    },
    {
      sn: 2,
      product: "Vitamin C Gummies",
      category: "Pharma Product",
      unitSold: "2,300",
      revenue: "7,500",
      percentage: "+2.00%",
    },
    {
      sn: 3,
      product: "Herbal Tea",
      category: "Pharma Product",
      unitSold: "1,500",
      revenue: "7,500",
      percentage: "-6.00%",
    },
    {
      sn: 4,
      product: "Amoxicillin",
      category: "Pharma Product",
      unitSold: "1,000",
      revenue: "7,500",
      percentage: "+18.00%",
    },
    {
      sn: 5,
      product: "Ibuprofen",
      category: "Pharma Product",
      unitSold: "980",
      revenue: "7,500",
      percentage: "+18.00%",
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

  const PercentageIcon = ({ percentage }: { percentage: string }) => {
    const isPositive = percentage.startsWith("+")
    return isPositive ? <UpIcon /> : <DownIcon />
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

  // Handle dropdown actions
  const handleViewDetails = (order: Order) => {
    router.push(`/sales/transactions/refund-detail/`)
    setActiveDropdown(null)
  }

  const handleForward = (order: Order) => {
    console.log("Forward:", order)
    setActiveDropdown(null)
  }

  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-semibold md:text-2xl">Product Sales Table</p>
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

                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("product")}>
                    <div className="flex items-center gap-2">
                      Product Name <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("category")}>
                    <div className="flex items-center gap-2">
                      Category <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("unitSold")}>
                    <div className="flex items-center gap-2">
                      Units Sold <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("revenue")}>
                    <div className="flex items-center gap-2">
                      Revenue <RxCaretSort />
                    </div>
                  </th>
                  <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("percentage")}>
                    <div className="flex items-center gap-2">
                      Percentage <RxCaretSort />
                    </div>
                  </th>

                  <th className="cursor-pointer border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
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
                      <div className="flex items-center gap-2">{order.product}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.category}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.unitSold)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          {order.unitSold}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.revenue)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span className="text-grey-400">₹</span>
                          {order.revenue}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(order.percentage)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <PercentageIcon percentage={order.percentage} />
                          {order.percentage}
                        </div>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap border-b px-4 py-1 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleDropdown(idx)} className="rounded p-1 hover:bg-gray-100">
                          <RxDotsVertical />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === idx && (
                          <div
                            ref={(el) => {
                              dropdownRefs.current[idx] = el
                            }}
                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(order)}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleForward(order)}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Forward
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
    </div>
  )
}

export default ProductSalesTable
