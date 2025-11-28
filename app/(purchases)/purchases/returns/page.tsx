// app/purchases/returns/page.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  fetchReturnPurchaseOrderWithCurrentFilters,
  selectReturnPaginationInfo,
  selectReturnPurchaseOrderError,
  selectReturnPurchaseOrderLoading,
  selectReturnPurchaseOrders,
  setFilters,
} from "app/api/store/returnPurchaseOrderSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import FilterIcon from "public/filter-icon"

type SortOrder = "asc" | "desc" | null

interface ReturnOrder {
  sn: number
  returnId: string
  supplier: string
  itemsReturned: string
  returnAmount: string
  returnStatus: string
  returnDate: string
  originalId: number
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const tableRowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
}

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
}

const skeletonVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: 0.8,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
}

const dateFilterVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: "1rem",
    transition: {
      duration: 0.3,
    },
  },
}

// Helper function to format date to the required format
const formatDateToAPI = (date: Date | null): string => {
  if (!date) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Helper function to set time for start date (00:00:00)
const setStartOfDay = (date: Date): Date => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

// Helper function to set time for end date (23:59:59)
const setEndOfDay = (date: Date): Date => {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

// Dropdown Popover Component
const ActionDropdown = ({
  order,
  onClose,
  position,
}: {
  order: ReturnOrder
  onClose: () => void
  position: { top: number; left: number }
}) => {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleViewDetails = () => {
    router.push(`/purchases/returns/${order.originalId}`)
    onClose()
  }

  const handleProcessReturn = () => {
    console.log("Process return:", order.returnId)
    onClose()
  }

  const handleGenerateCreditNote = () => {
    console.log("Generate credit note for:", order.returnId)
    onClose()
  }

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
    <motion.div
      ref={dropdownRef}
      className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{
        top: position.top,
        left: position.left,
      }}
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="py-1">
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleViewDetails}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700"
        >
          View Return Details
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleProcessReturn}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700"
        >
          Process Return
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateCreditNote}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700"
        >
          Generate Credit Note
        </motion.button>
      </div>
    </motion.div>
  )
}

// Skeleton Loading Component
const SkeletonRow = ({ index }: { index: number }) => (
  <motion.tr variants={tableRowVariants} custom={index} initial="hidden" animate="visible">
    {Array.from({ length: 8 }).map((_, cellIndex) => (
      <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
        <motion.div
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
          className="h-4 rounded bg-gray-200"
        ></motion.div>
      </td>
    ))}
  </motion.tr>
)

// Date Range Filter Component
const DateRangeFilter = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApply,
  onClear,
}: {
  startDate: Date | null
  endDate: Date | null
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
  onApply: () => void
  onClear: () => void
}) => {
  return (
    <motion.div
      variants={dateFilterVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="mb-4 flex flex-wrap items-center gap-4 rounded-md border bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">From:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="rounded-md border border-gray-300 bg-transparent p-2 text-sm"
          placeholderText="Start date"
          dateFormat="dd/MM/yyyy"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">To:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate as Date | undefined}
          className="rounded-md border border-gray-300 bg-transparent p-2 text-sm"
          placeholderText="End date"
          dateFormat="dd/MM/yyyy"
        />
      </div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <ButtonModule variant="primary" size="sm" onClick={onApply} disabled={!startDate || !endDate}>
          Apply Dates
        </ButtonModule>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <ButtonModule variant="outline" size="sm" onClick={onClear}>
          Clear Dates
        </ButtonModule>
      </motion.div>
    </motion.div>
  )
}

const ReturnsPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Use return purchase order slice selectors
  const returnPurchaseOrders = useAppSelector(selectReturnPurchaseOrders)
  const loading = useAppSelector(selectReturnPurchaseOrderLoading)
  const error = useAppSelector(selectReturnPurchaseOrderError)
  const paginationInfo = useAppSelector(selectReturnPaginationInfo)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  // Date range filter states
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showDateFilter, setShowDateFilter] = useState(false)

  // Transform return API data to match your ReturnOrder type
  const [orders, setOrders] = useState<ReturnOrder[]>([])

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
    // Reset date filters anytime the page opens, then fetch fresh data
    setStartDate(null)
    setEndDate(null)
    dispatch(
      setFilters({
        startDate: "",
        endDate: "",
        pageNo: 0,
      })
    )
    dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
  }, [dispatch])

  // When server pagination info changes, keep local currentPage in sync
  useEffect(() => {
    if (paginationInfo && typeof paginationInfo.pageNo === "number") {
      setCurrentPage(paginationInfo.pageNo + 1)
    }
  }, [paginationInfo?.pageNo])

  // Function to get supplier name (you might need to fetch suppliers separately)
  const getSupplierName = (supplierId: number) => {
    // This is a placeholder - you might need to fetch suppliers from your API
    // or modify the return endpoint to include supplier names
    return `Supplier #${supplierId}`
  }

  // Calculate total items in a return purchase order
  const calculateTotalItems = (purchaseOrderItems: any[]) => {
    return purchaseOrderItems.length
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")
  }

  useEffect(() => {
    // Transform return purchase order API data to match your ReturnOrder type
    if (returnPurchaseOrders && returnPurchaseOrders.length > 0) {
      const transformedOrders: ReturnOrder[] = returnPurchaseOrders.map((purchase, index) => ({
        sn: index + 1,
        returnId: `#RET${purchase.purchaseOrderId.toString().padStart(5, "0")}`,
        supplier: getSupplierName(purchase.supplierId),
        itemsReturned: `${calculateTotalItems(purchase.purchaseOrderItems)} items`,
        returnAmount: formatCurrency(purchase.totalAmount || 0),
        returnStatus: purchase.orderStatus || purchase.status || "RETURNED",
        returnDate: formatDate(purchase.orderDate),
        originalId: purchase.purchaseOrderId,
      }))
      setOrders(transformedOrders)
    } else {
      setOrders([])
    }
  }, [returnPurchaseOrders])

  const getReturnStatusStyle = (returnStatus: string) => {
    switch (returnStatus.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
      case "PROCESSED":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "PENDING":
      case "REVIEWED":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "REJECTED":
      case "CANCELLED":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "RETURNED":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "PARTIAL_RETURN":
        return { backgroundColor: "#F0F0F0", color: "#666666" }
      default:
        return { backgroundColor: "#F0F0F0", color: "#666666" }
    }
  }

  const dotStyle = (returnStatus: string) => {
    switch (returnStatus.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
      case "PROCESSED":
        return { backgroundColor: "#589E67" }
      case "PENDING":
      case "REVIEWED":
        return { backgroundColor: "#D28E3D" }
      case "REJECTED":
      case "CANCELLED":
        return { backgroundColor: "#AF4B4B" }
      case "RETURNED":
        return { backgroundColor: "#4976F4" }
      case "PARTIAL_RETURN":
        return { backgroundColor: "#666666" }
      default:
        return { backgroundColor: "#666666" }
    }
  }

  const toggleSort = (column: keyof ReturnOrder) => {
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

  // Reset to first page when searching locally
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Update filters and refetch data using current filters from store (API uses 0-based indexing)
    dispatch(setFilters({ pageNo: pageNumber - 1 }))
    dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
  }

  const toggleDropdown = (returnId: string, event: React.MouseEvent) => {
    if (activeDropdown === returnId) {
      setActiveDropdown(null)
    } else {
      const rect = event.currentTarget.getBoundingClientRect()
      const dropdownHeight = 112
      const viewportHeight = window.innerHeight

      let topPosition = rect.bottom + window.scrollY
      if (rect.bottom + dropdownHeight > viewportHeight) {
        topPosition = rect.top + window.scrollY - dropdownHeight
      }

      setDropdownPosition({
        top: topPosition,
        left: rect.right + window.scrollX - 192,
      })
      setActiveDropdown(returnId)
    }
  }

  // Apply date range filter with correct format
  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      // Set start date to beginning of day (00:00:00)
      const formattedStartDate = formatDateToAPI(setStartOfDay(startDate))
      // Set end date to end of day (23:59:59)
      const formattedEndDate = formatDateToAPI(setEndOfDay(endDate))

      console.log("Sending dates to API:", {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      })

      // Update filters with date range and reset to first page
      dispatch(
        setFilters({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          pageNo: 0,
        })
      )
      dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
      setCurrentPage(1)
    }
  }

  // Clear date range filter
  const handleClearDateFilter = () => {
    setStartDate(null)
    setEndDate(null)
    setShowDateFilter(false)

    // Update filters to remove date range and reset to first page
    dispatch(
      setFilters({
        startDate: "",
        endDate: "",
        pageNo: 0,
      })
    )
    dispatch(fetchReturnPurchaseOrderWithCurrentFilters())
    setCurrentPage(1)
  }

  const filteredOrders = orders.filter((order) =>
    Object.values(order).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })
  )

  // Determine whether to use server-side pagination (from API) or client-side slicing
  const usingServerPagination = Boolean(paginationInfo)
  // Get current orders for pagination
  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = usingServerPagination
    ? filteredOrders
    : filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Use API pagination info if available, otherwise use client-side pagination
  const totalPages = paginationInfo?.totalPages || Math.ceil(filteredOrders.length / itemsPerPage)
  const totalElements = paginationInfo?.totalElements || filteredOrders.length

  // Function to generate pagination buttons with ellipsis
  const getPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i)
      }
    } else {
      buttons.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        endPage = 4
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }

      if (startPage > 2) {
        buttons.push("ellipsis-left")
      }

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i)
      }

      if (endPage < totalPages - 1) {
        buttons.push("ellipsis-right")
      }

      buttons.push(totalPages)
    }

    return buttons
  }

  return (
    <motion.section
      className="h-auto w-full bg-[#F4F9F8]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="flex flex-col">
            <div className="max-sm-my-4 flex w-full gap-6 px-8 max-md:flex-col  max-sm:px-3 max-sm:py-4 md:my-8">
              <div className="w-full">
                <div className="mb-6 flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-label="Go back"
                    title="Go back"
                  >
                    <svg
                      width="1em"
                      height="1em"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="new-arrow-right rotate-180 transform"
                    >
                      <path
                        d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </motion.button>
                  <motion.h1
                    className="text-xl font-bold"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Returned Purchases
                  </motion.h1>
                </div>

                <motion.div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5" layout>
                  {/* Header */}
                  <div className="items-center justify-between border-b py-2 md:flex md:py-4">
                    <p className="whitespace-nowrap text-lg font-semibold max-sm:pb-3 md:text-2xl">
                      Return Transactions
                    </p>
                    <div className="flex w-full justify-end gap-4">
                      <SearchModule
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onCancel={handleCancelSearch}
                      />

                      {/* Date Filter Button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <ButtonModule
                          variant="black"
                          size="md"
                          icon={<FilterIcon />}
                          iconPosition="start"
                          onClick={() => setShowDateFilter(!showDateFilter)}
                        >
                          <p className="max-sm:hidden">Date Filter</p>
                        </ButtonModule>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <ButtonModule
                          variant="black"
                          size="md"
                          icon={<ExportIcon />}
                          iconPosition="end"
                          onClick={() => alert("Export functionality")}
                        >
                          <p className="max-sm:hidden">Export Returns</p>
                        </ButtonModule>
                      </motion.div>
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <AnimatePresence>
                    {showDateFilter && (
                      <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        onApply={handleApplyDateFilter}
                        onClear={handleClearDateFilter}
                      />
                    )}
                  </AnimatePresence>

                  {loading ? (
                    // Skeleton Loading State
                    <div className="w-full overflow-x-auto border-l border-r">
                      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                        <thead>
                          <tr>
                            {Array.from({ length: 8 }).map((_, index) => (
                              <th key={index} className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                                <div className="h-4 rounded bg-gray-300"></div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 5 }).map((_, index) => (
                            <SkeletonRow key={index} index={index} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : error ? (
                    <motion.div
                      className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <EmptyState />
                        <p className="text-xl font-bold text-[#D82E2E]">Failed to load returns.</p>
                        <p>{error}</p>
                      </div>
                    </motion.div>
                  ) : filteredOrders.length === 0 ? (
                    <motion.div
                      className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EmptyState />
                      <p className="text-base font-bold text-[#202B3C]">
                        {searchText ? "No returns match your search." : "No returns found."}
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-full overflow-x-auto border-l border-r">
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
                                onClick={() => toggleSort("returnId")}
                              >
                                <div className="flex items-center gap-2">
                                  Return ID <RxCaretSort />
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
                                onClick={() => toggleSort("itemsReturned")}
                              >
                                <div className="flex items-center gap-2">
                                  Items Returned <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                                onClick={() => toggleSort("returnAmount")}
                              >
                                <div className="flex items-center gap-2">
                                  Return Amount <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                                onClick={() => toggleSort("returnStatus")}
                              >
                                <div className="flex items-center gap-2">
                                  Status <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                                onClick={() => toggleSort("returnDate")}
                              >
                                <div className="flex items-center gap-2">
                                  Return Date <RxCaretSort />
                                </div>
                              </th>
                              <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                                <div className="flex items-center gap-2">Action</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <AnimatePresence>
                              {currentOrders.map((order, index) => (
                                <motion.tr
                                  key={order.returnId}
                                  variants={tableRowVariants}
                                  custom={index}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  whileHover={{ backgroundColor: "#f8f9fa" }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                                      {order.sn}
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <div className="flex items-center gap-2">{order.returnId}</div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <div className="flex items-center gap-2">{order.supplier}</div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <div className="flex items-center gap-2">{order.itemsReturned}</div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                    <div className="flex">
                                      <motion.div
                                        style={getReturnStatusStyle(order.returnStatus)}
                                        className="flex items-center justify-center gap-1 rounded-full px-4 py-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <span className="text-grey-400">₹</span>
                                        {order.returnAmount}
                                      </motion.div>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                    <div className="flex">
                                      <motion.div
                                        style={getReturnStatusStyle(order.returnStatus)}
                                        className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <span
                                          className="size-2 rounded-full"
                                          style={dotStyle(order.returnStatus)}
                                        ></span>
                                        {order.returnStatus}
                                      </motion.div>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <img src="/DashboardImages/Calendar.png" alt="Calendar" />
                                      {order.returnDate}
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                                    <div className="relative flex items-center gap-2">
                                      <motion.button
                                        onClick={(e) => toggleDropdown(order.returnId, e)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <RxDotsVertical />
                                      </motion.button>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>

                      {/* Render dropdown outside the table */}
                      <AnimatePresence>
                        {activeDropdown && (
                          <ActionDropdown
                            order={currentOrders.find((order) => order.returnId === activeDropdown)!}
                            onClose={() => setActiveDropdown(null)}
                            position={dropdownPosition}
                          />
                        )}
                      </AnimatePresence>

                      {/* Pagination */}
                      <motion.div
                        className="flex items-center justify-between border-t px-4 py-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-sm text-gray-700">
                          {usingServerPagination && paginationInfo ? (
                            (() => {
                              const start = paginationInfo.pageNo * paginationInfo.pageSize + 1
                              const end = paginationInfo.pageNo * paginationInfo.pageSize + (filteredOrders.length || 0)
                              return (
                                <>
                                  Showing {start} to {Math.min(end, paginationInfo.totalElements)} of{" "}
                                  {paginationInfo.totalElements} entries
                                </>
                              )
                            })()
                          ) : (
                            <>
                              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                              {totalElements} entries
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`rounded-full px-2 py-1 ${
                              currentPage === 1
                                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            <MdOutlineArrowBackIosNew />
                          </motion.button>

                          {getPaginationButtons().map((page, index) => {
                            if (page === "ellipsis-left" || page === "ellipsis-right") {
                              return (
                                <span key={index} className="px-2 py-1">
                                  ...
                                </span>
                              )
                            }

                            return (
                              <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePageChange(page as number)}
                                className={`rounded-full px-3 py-1 ${
                                  currentPage === page ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                                }`}
                              >
                                {page}
                              </motion.button>
                            )
                          })}

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`rounded-full px-2 py-1 ${
                              currentPage === totalPages
                                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            <MdOutlineArrowForwardIos />
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default ReturnsPage
