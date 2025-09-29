import React, { useState, useEffect, useRef } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import OutgoingIcon from "public/outgoing-icon"
import IncomingIcon from "public/incoming-icon"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import { getBankLogo } from "components/ui/BanksLogo/bank-logo"
import EmptyState from "public/empty-state"
import AddBusiness from "public/add-business"
import { useRouter } from "next/navigation"
import PurchaseMenu from "components/ui/CardMenu/purchase-menu"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllPurchases, selectPurchases } from "app/api/store/purchaseSlice"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  purchaseId: string
  supplier: string
  itemPurchased: string
  payment70: string
  orderStatus: string
  date: string
  originalId: number // Added to store the original purchase order ID
}

// Dropdown Popover Component
const ActionDropdown = ({
  order,
  onClose,
  position,
}: {
  order: Order
  onClose: () => void
  position: { top: number; left: number }
}) => {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleEdit = () => {
    // Navigate to the edit page for this specific purchase order
    router.push(`/purchases/edit/${order.originalId}`)
    onClose()
  }

  const handleViewDetails = () => {
    // Navigate directly without any async operations
    router.push(`/purchases/${order.originalId}`)
    onClose()
  }

  const handleConvertToPurchase = () => {
    console.log("Convert to purchase:", order.purchaseId)
    onClose()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="py-1">
        {/* Only show Edit option if purchase is not approved */}
        {order.orderStatus !== "APPROVED" && (
          <button
            onClick={handleEdit}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleViewDetails}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          View Details
        </button>
        {order.orderStatus === "REVIEWED" && (
          <button
            onClick={handleViewDetails}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Convert to Purchase
          </button>
        )}
      </div>
    </div>
  )
}

// Skeleton Loading Component
const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 8 }).map((_, index) => (
      <td key={index} className="whitespace-nowrap border-b px-4 py-3">
        <div className="h-4 animate-pulse rounded bg-gray-200"></div>
      </td>
    ))}
  </tr>
)

const PurchaseOverview = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { purchases, loading, error } = useAppSelector(selectPurchases)
  const { suppliers } = useAppSelector(selectSuppliers)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  // Transform API data to match your Order type
  const [orders, setOrders] = useState<Order[]>([])

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    // Fetch purchases and suppliers when component mounts
    dispatch(fetchAllPurchases())
    dispatch(fetchAllSuppliers())
  }, [dispatch])

  // Function to get supplier name by ID
  const getSupplierNameById = (supplierId: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier ? supplier.name : `Supplier #${supplierId}`
  }

  useEffect(() => {
    // Transform API data to match your Order type when purchases change
    if (purchases && purchases.length > 0) {
      const transformedOrders: Order[] = purchases.map((purchase, index) => ({
        sn: index + 1,
        purchaseId: `#PUR${purchase.purchaseOrderId.toString().padStart(5, "0")}`,
        supplier: getSupplierNameById(purchase.supplierId),
        itemPurchased: `${purchase.purchaseOrderItems.length} items`,
        // FIXED: Added null check for totalAmount
        payment70: (purchase.totalAmount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        orderStatus: purchase.orderStatus,
        date: formatDate(purchase.orderDate),
        originalId: purchase.purchaseOrderId, // Store the original ID for API calls
      }))
      setOrders(transformedOrders)
    } else {
      setOrders([])
    }
  }, [purchases, suppliers])

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")
  }

  const getPaymentStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "APPROVED":
      case "Completed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "REVIEWED":
      case "Reviewed":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Not Paid":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "Overdue":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "CREATED":
        return { backgroundColor: "#F0F0F0", color: "#666666" }
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

  const dotStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "APPROVED":
      case "Completed":
        return { backgroundColor: "#589E67" }
      case "REVIEWED":
      case "Reviewed":
        return { backgroundColor: "#D28E3D" }
      case "Not Paid":
      case "Overdue":
        return { backgroundColor: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#4976F4" }
      case "CREATED":
        return { backgroundColor: "#666666" }
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
    router.push(`order-creation`)
  }

  const toggleDropdown = (purchaseId: string, event: React.MouseEvent) => {
    if (activeDropdown === purchaseId) {
      setActiveDropdown(null)
    } else {
      // Calculate position for dropdown
      const rect = event.currentTarget.getBoundingClientRect()
      const dropdownHeight = 112 // Approximate height of dropdown with 3 items
      const viewportHeight = window.innerHeight

      // Check if dropdown would go off screen at the bottom
      let topPosition = rect.bottom + window.scrollY
      if (rect.bottom + dropdownHeight > viewportHeight) {
        // If it would go off screen, position it above the button
        topPosition = rect.top + window.scrollY - dropdownHeight
      }

      setDropdownPosition({
        top: topPosition,
        left: rect.right + window.scrollX - 192, // 192px is the width of the dropdown
      })
      setActiveDropdown(purchaseId)
    }
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

  // Function to generate pagination buttons with ellipsis
  const getPaginationButtons = () => {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const buttons = []
    const maxVisiblePages = 5 // Maximum number of page buttons to show

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible pages, show all
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i)
      }
    } else {
      // Always show first page
      buttons.push(1)

      // Calculate start and end of visible page range
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're at the beginning
      if (currentPage <= 3) {
        endPage = 4
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        buttons.push("ellipsis-left")
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        buttons.push("ellipsis-right")
      }

      // Always show last page
      buttons.push(totalPages)
    }

    return buttons
  }

  const BankLogo = ({ bankName }: { bankName: string }) => {
    const logo = getBankLogo(bankName)

    if (!logo) {
      return (
        <div className="flex items-center gap-2">
          <img src="/DashboardImages/Package.png" alt="Default bank" className="icon-style h-5 w-5" />
          <img src="/DashboardImages/Package-dark.png" alt="Default bank dark" className="dark-icon-style h-5 w-5" />
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <img src={logo.light} alt={logo.alt} className="icon-style h-5 w-5" />
        {logo.dark && <img src={logo.dark} alt={logo.alt} className="dark-icon-style h-5 w-5" />}
      </div>
    )
  }

  return (
    <>
      <PurchaseMenu />
      <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
        {/* Header */}
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">Transactions</p>
          <div className="flex w-full justify-end gap-4">
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
              <p className="whitespace-nowrap max-sm:hidden">Add New Purchase</p>
            </ButtonModule>
          </div>
        </div>

        {loading ? (
          // Skeleton Loading State
          <div className="w-full overflow-x-auto border-l border-r">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <th key={index} className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="h-4 animate-pulse rounded bg-gray-300"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <div className="text-center">
              <EmptyState />
              <p className="text-xl font-bold text-[#D82E2E]">Failed to load purchases.</p>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <EmptyState />
            <p className="text-base font-bold text-[#202B3C]">No purchases found.</p>
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
                      onClick={() => toggleSort("purchaseId")}
                    >
                      <div className="flex items-center gap-2">
                        Purchase ID <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("supplier")}
                    >
                      <div className="flex items-center gap-2">
                        Supplier Name <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("itemPurchased")}
                    >
                      <div className="flex items-center gap-2">
                        Items <RxCaretSort />
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
                      onClick={() => toggleSort("orderStatus")}
                    >
                      <div className="flex items-center gap-2">
                        Status <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Date <RxCaretSort />
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
                        <div className="flex items-center gap-2">{order.purchaseId}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">{order.supplier}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">{order.itemPurchased}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex">
                          <div
                            style={getPaymentStyle(order.orderStatus)}
                            className="flex items-center justify-center gap-1 rounded-full px-4 py-2"
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
                            <span className="size-2 rounded-full" style={dotStyle(order.orderStatus)}></span>
                            {order.orderStatus}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <img src="/DashboardImages/Calendar.png" alt="dekalo" />
                          {order.date}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <div className="relative flex items-center gap-2">
                          <button onClick={(e) => toggleDropdown(order.purchaseId, e)}>
                            <RxDotsVertical />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Render dropdown outside the table */}
            {activeDropdown && (
              <ActionDropdown
                order={currentOrders.find((order) => order.purchaseId === activeDropdown)!}
                onClose={() => setActiveDropdown(null)}
                position={dropdownPosition}
              />
            )}

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

                {getPaginationButtons().map((page, index) => {
                  if (page === "ellipsis-left" || page === "ellipsis-right") {
                    return (
                      <span key={index} className="px-2 py-1">
                        ...
                      </span>
                    )
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => paginate(page as number)}
                      className={`rounded-full px-3 py-1 ${
                        currentPage === page ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

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

export default PurchaseOverview
