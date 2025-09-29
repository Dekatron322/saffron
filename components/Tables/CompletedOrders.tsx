import React, { useState } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  orderId: string
  customer: string
  itemPurchased: string
  payment70: string
  orderStatus: string
  paymentStatus: string
  date: string
}

const CompletedOrders = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [orders, setOrders] = useState<Order[]>([
    {
      sn: 1,
      orderId: "#ORD12345",
      customer: "Robert Fox",
      itemPurchased: "Paracetamol (2x)",
      payment70: "3,679,980",
      orderStatus: "Completed",
      paymentStatus: "Paid",
      date: "2024-12-19",
    },
    {
      sn: 2,
      orderId: "#ORD12346",
      customer: "Robert Lee",
      itemPurchased: "Ibuprofen",
      payment70: "3,679,980",
      orderStatus: "Completed",
      paymentStatus: "Paid",
      date: "2024-12-20",
    },
    {
      sn: 3,
      orderId: "#ORD12347",
      customer: "Robert Chang",
      itemPurchased: "Amoxicillin",
      payment70: "3,679,980",
      orderStatus: "Pending",
      paymentStatus: "Paid",
      date: "2024-12-20",
    },
    {
      sn: 4,
      orderId: "#ORD12348",
      customer: "Robert Lee",
      itemPurchased: "Insulin Pen (10x)",
      payment70: "3,679,980",
      orderStatus: "Overdue",
      paymentStatus: "Paid",
      date: "2024-12-20",
    },
    {
      sn: 5,
      orderId: "#ORD12349",
      customer: "Robert Lee",
      itemPurchased: "Vitamin D Supplements",
      payment70: "3,679,980",
      orderStatus: "Pending",
      paymentStatus: "Paid",
      date: "2024-12-20",
    },
  ])

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  const closeDropdown = () => {
    setActiveDropdown(null)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".dropdown-container")) {
        closeDropdown()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
      case "Overdue":
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
      case "Overdue":
        return { backgroundColor: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#4976F4" }
      default:
        return {}
    }
  }

  const toggleSort = (column: keyof Order) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)

    const sortedOrders = [...orders].sort((a, b) => {
      if (a[column] < b[column]) return isAscending ? 1 : -1
      if (a[column] > b[column]) return isAscending ? -1 : 1
      return 0
    })

    setOrders(sortedOrders)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const filteredOrders = orders.filter((order) =>
    Object.values(order).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })
  )

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <>
      <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
        {/* Header */}
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">Total Orders</p>
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
              onClick={() => alert("Button clicked!")}
            >
              <p className="max-sm:hidden">Export</p>
            </ButtonModule>
          </div>
        </div>

        {error ? (
          <div className="flex h-60 flex-col  items-center justify-center gap-2 bg-[#F4F9F8]">
            <div className="text-center">
              <EmptyState />
              <p className="text-xl font-bold text-[#D82E2E]">Failed to load recent activities.</p>
              <p>Please refresh or try again later.</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex h-60 flex-col  items-center justify-center gap-2 bg-[#F4F9F8]">
            <EmptyState />
            <p className="text-base font-bold text-[#202B3C]">No Activity found.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto border-l border-r ">
              <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th
                      className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("sn")}
                    >
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      SN <RxCaretSort />
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("orderId")}
                    >
                      <div className="flex items-center gap-2">
                        Order ID <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("customer")}
                    >
                      <div className="flex items-center gap-2">
                        Customer Name <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("itemPurchased")}
                    >
                      <div className="flex items-center gap-2">
                        Item Ordered <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("payment70")}
                    >
                      <div className="flex items-center gap-2">
                        Amount <RxCaretSort />
                      </div>
                    </th>

                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Date Placed <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("paymentStatus")}
                    >
                      <div className="flex items-center gap-2">
                        Payment Status <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                          {order.sn}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">{order.orderId}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <img src="/DashboardImages/UserCircle.png" alt="dekalo" className="icon-style" />
                          <img src="/DashboardImages/UserCircle-dark.png" alt="dekalo" className="dark-icon-style" />
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
                        <div className="flex items-center gap-2">
                          <img src="/DashboardImages/Calendar.png" alt="dekalo" />
                          {order.date}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex">
                          <div
                            style={getPaymentStyle(order.paymentStatus)}
                            className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          >
                            <span className="size-2 rounded-full" style={dotStyle(order.paymentStatus)}></span>
                            {order.paymentStatus}
                          </div>
                        </div>
                      </td>
                      <td className="dropdown-container relative whitespace-nowrap border-b px-4 py-1 text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleDropdown(index)} className="rounded p-1 hover:bg-gray-100">
                            <RxDotsVertical />
                          </button>
                        </div>
                        {activeDropdown === index && (
                          <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  alert(`Viewing details for order: ${order.orderId}`)
                                  closeDropdown()
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Invoice
                              </button>
                              <button
                                onClick={() => {
                                  alert(`Viewing details for order: ${order.orderId}`)
                                  closeDropdown()
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Download Invoice
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                {filteredOrders.length} entries
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

                {Array.from({ length: Math.ceil(filteredOrders.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`rounded-full px-3 py-1 ${
                      currentPage === index + 1 ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
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
      </div>
    </>
  )
}

export default CompletedOrders
