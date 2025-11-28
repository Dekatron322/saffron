import React, { useEffect, useState } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import { getBankLogo } from "components/ui/BanksLogo/bank-logo"
import EmptyState from "public/empty-state"

type SortOrder = "asc" | "desc" | null
type Order = {
  orderId: string
  min: string
  max: string
  bankFee: string
  switchFee: string
  payment70: string
  orderStatus: string
  date: string
}

const DebitFeesTable = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [error, setError] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [orders, setOrders] = useState<Order[]>([
    {
      orderId: "#ORD12345",
      min: "1",
      max: "5,000",
      bankFee: "7.00000",
      switchFee: "3.75000",
      payment70: "3,679,980",
      orderStatus: "Completed",
      date: "2024-12-19",
    },
    {
      orderId: "#ORD12346",
      min: "5,001",
      max: "20,000",
      bankFee: "23.1c232b",
      switchFee: "3.75000",
      payment70: "3,679,980",
      orderStatus: "Completed",
      date: "2024-12-20",
    },
    {
      orderId: "#ORD12347",
      min: "20,001",
      max: "1,000,000",
      bankFee: "47.1c232b",
      switchFee: "3.75000",
      payment70: "3,679,980",
      orderStatus: "Cancelled",
      date: "2024-12-20",
    },
  ])

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

  const toggleMenu = (orderId: string) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!(event.target as Element).closest(".menu-container")) {
      setOpenMenuId(null)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleEdit = (orderId: string) => {
    console.log("Edit", orderId)
    setOpenMenuId(null)
    // Add your edit logic here
  }

  const handleDelete = (orderId: string) => {
    console.log("Delete", orderId)
    setOrders(orders.filter((order) => order.orderId !== orderId))
    setOpenMenuId(null)
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

  const BankLogo = ({ bankName }: { bankName: string }) => {
    const logo = getBankLogo(bankName)

    if (!logo) {
      return (
        <div className="flex items-center gap-2">
          <img src="/DashboardImages/Package.png" alt="Default bank" className="icon-style size-5" />
          <img src="/DashboardImages/Package-dark.png" alt="Default bank dark" className="dark-icon-style size-5" />
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <img src={logo.light} alt={logo.alt} className="icon-style size-5" />
        {logo.dark && <img src={logo.dark} alt={logo.alt} className="dark-icon-style size-5" />}
      </div>
    )
  }

  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">All Debit Fees</p>
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
            <p className="max-sm:hidden">Export CSV</p>
          </ButtonModule>
        </div>
      </div>

      {error ? (
        <div className="flex h-60 flex-col  items-center justify-center gap-2 bg-[#f9f9f9]">
          <div className="text-center">
            <EmptyState />
            <p className="text-xl font-bold text-[#D82E2E]">No Fees Added Yet.</p>
            <p>Please refresh or try again later.</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-60 flex-col  items-center justify-center gap-2 bg-[#f9f9f9]">
          <EmptyState />
          <p className="text-base font-bold text-[#202B3C]">No Fees Added Yet.</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto border-l border-r bg-[#f9f9f9]">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("orderId")}
                  >
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    Debit Fee ID <RxCaretSort />
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("min")}
                  >
                    <div className="flex items-center gap-2">
                      Minimum <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("max")}
                  >
                    <div className="flex items-center gap-2">
                      Maximum <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("bankFee")}
                  >
                    <div className="flex items-center gap-2">
                      Bank Fee
                      <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("switchFee")}
                  >
                    <div className="flex items-center gap-2">
                      Switch Fee <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Date Created <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Date Approved <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
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
                        {order.orderId}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.min}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">{order.max}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <BankLogo bankName={order.bankFee} />
                        {order.bankFee}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 rounded-full py-1">{order.switchFee}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <img src="/DashboardImages/Calendar.png" alt="dekalo" />
                        {order.date}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <img src="/DashboardImages/Calendar.png" alt="dekalo" />
                        {order.date}
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap border-b px-4 py-1 text-sm">
                      <div className="menu-container flex items-center gap-2">
                        <button onClick={() => toggleMenu(order.orderId)} className="rounded p-1 hover:bg-gray-100">
                          <RxDotsVertical />
                        </button>

                        {openMenuId === order.orderId && (
                          <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border bg-white shadow-lg">
                            <div className="py-1">
                              <button
                                onClick={() => handleEdit(order.orderId)}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(order.orderId)}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700  hover:bg-gray-100"
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
                    currentPage === index + 1 ? "bg-primary text-black" : "bg-gray-200 hover:bg-gray-300"
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
  )
}

export default DebitFeesTable
