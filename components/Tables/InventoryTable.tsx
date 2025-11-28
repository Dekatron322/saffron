import React, { useEffect, useRef, useState } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import { getBankLogo } from "components/ui/BanksLogo/bank-logo"
import EmptyState from "public/empty-state"
import AddBusiness from "public/add-business"
import { useRouter } from "next/navigation"
import InventoryMenu from "components/ui/CardMenu/inventory-menu"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  productName: string
  category: string
  batchNo: string
  manufacturer: string
  stockStatus: string
  qty: string
}

const DropdownMenu = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const router = useRouter()

  const handleViewDetails = () => {
    // Implement view details logic
    console.log("View details for order:", order.sn)
    onClose()
  }

  const handleEdit = () => {
    // Implement edit logic
    console.log("Edit order:", order.sn)
    onClose()
  }

  const handleDelete = () => {
    // Implement delete logic
    console.log("Delete order:", order.sn)
    onClose()
  }

  return (
    <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="py-1">
        <button
          onClick={handleViewDetails}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          View Details
        </button>
        <button
          onClick={handleEdit}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

const InventoryTable = () => {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [error, setError] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])

  const [orders, setOrders] = useState<Order[]>([
    {
      sn: 1,
      productName: "Amoxicillin 500mg",
      category: "Pharma Product",
      batchNo: "B-09342",
      manufacturer: "Medcare Labs",
      stockStatus: "In Stock",
      qty: "110",
    },
    {
      sn: 2,
      productName: "Paracetamol 250mg",
      category: "Generic Product",
      batchNo: "B-01892",
      manufacturer: "HealSure Ltd.",
      stockStatus: "Expired",
      qty: "230",
    },
    {
      sn: 3,
      productName: "Vitamin C Tablets",
      category: "Food Related Items",
      batchNo: "B-02310",
      manufacturer: "NutriHealth Inc.",
      stockStatus: "Low Stock",
      qty: "1110",
    },
  ])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)
      ) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  const getPaymentStyle = (stockStatus: string) => {
    switch (stockStatus) {
      case "Paid":
      case "In Stock":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Expired":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Expired":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "Low Stock":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }

  const dotStyle = (stockStatus: string) => {
    switch (stockStatus) {
      case "Paid":
      case "In Stock":
        return { backgroundColor: "#589E67" }
      case "Expired":
        return { backgroundColor: "#D28E3D" }
      case "Expired":
        return { backgroundColor: "#D28E3D" }
      case "Low Stock":
        return { backgroundColor: "#AF4B4B" }
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

  const handleAddInvoice = () => {
    router.push(`product/add-product`)
  }

  const filteredOrders = orders.filter((order) =>
    Object.values(order).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })
  )

  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

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
    <>
      <InventoryMenu />
      <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
        {/* Header */}
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">Transactions</p>
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

            <ButtonModule
              variant="ghost"
              size="md"
              icon={<AddBusiness />}
              iconPosition="end"
              onClick={() => handleAddInvoice()}
            >
              <p className="whitespace-nowrap max-sm:hidden"> Add New Product</p>
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
                      onClick={() => toggleSort("productName")}
                    >
                      <div className="flex items-center gap-2">
                        Product Name <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("category")}
                    >
                      <div className="flex items-center gap-2">
                        Category <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("batchNo")}
                    >
                      <div className="flex items-center gap-2">
                        Batch No. <RxCaretSort />
                      </div>
                    </th>

                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("manufacturer")}
                    >
                      <div className="flex items-center gap-2">
                        Manufacturer <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("stockStatus")}
                    >
                      <div className="flex items-center gap-2">
                        Status <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("qty")}
                    >
                      <div className="flex items-center gap-2">
                        Qty <RxCaretSort />
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
                        <div className="flex items-center gap-2">{order.productName}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">{order.category}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">{order.batchNo}</div>
                      </td>

                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex">
                          <div
                            style={getPaymentStyle(order.manufacturer)}
                            className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          >
                            {order.manufacturer}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex">
                          <div
                            style={getPaymentStyle(order.stockStatus)}
                            className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          >
                            <span className="size-2 rounded-full" style={dotStyle(order.stockStatus)}></span>
                            {order.stockStatus}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">{order.qty}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <div
                          className="relative flex items-center gap-2"
                          ref={(el) => {
                            dropdownRefs.current[index] = el
                          }}
                        >
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
                          >
                            <RxDotsVertical />
                          </button>
                          {activeDropdown === index && (
                            <DropdownMenu order={order} onClose={() => setActiveDropdown(null)} />
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

export default InventoryTable
