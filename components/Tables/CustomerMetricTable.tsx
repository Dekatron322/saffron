"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Customer } from "app/api/store/customerSlice"
import { RxCaretSort } from "react-icons/rx"
import EmptyState from "public/empty-state"
import { SearchModule } from "components/ui/Search/search-module"
import FilterIcon from "public/Icons/filter-icon"
import { ButtonModule } from "components/ui/Button/Button"
import AddBusiness from "public/add-business"
import ExportIcon from "public/export-icon"
import EditIcon from "public/edit-icon"
import MessageIcon from "public/messages"
import WhatsappIcon from "public/whatsapp"
import CardPosIcon from "public/card-pos-icon"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import EditCustomerModal from "components/ui/Modal/edit-customer-modal"
import LocationIcon from "public/location"
import NotificationIcon from "public/notification-icon"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchSalesByCustomerDetails } from "app/api/store/customerSlice"
import { format } from "date-fns"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import Link from "next/link"

interface CustomerTableProps {
  customers: Customer[]
  loading: boolean
  error: string | null
}

const SkeletonLoader = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full items-start gap-4">
      <div className="w-1/4 rounded-md bg-white p-4">
        <div className="flex h-10 items-center gap-2">
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
          <div className="size-6 animate-pulse rounded-md bg-gray-200"></div>
        </div>
        <div className="mt-3">
          <div className="h-6 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-gray-200"></div>
          ))}
        </div>
      </div>
      <div className="w-3/4 rounded-md bg-white p-4">
        <div className="mb-6 border-b pb-4">
          <div className="h-8 w-1/3 animate-pulse rounded-md bg-gray-200"></div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="h-4 w-1/2 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded-md bg-gray-200"></div>
            </div>
            <div>
              <div className="h-4 w-1/2 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded-md bg-gray-200"></div>
            </div>
          </div>
        </div>

        <div className="h-6 w-1/3 animate-pulse rounded-md bg-gray-200"></div>
        <div className="mt-4 overflow-x-auto">
          <div className="h-8 w-full animate-pulse rounded-md bg-gray-200"></div>
          <div className="mt-2 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-md bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const CustomerTable = ({ customers, loading, error }: CustomerTableProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { customerSales } = useAppSelector((state) => state.customer)

  const [searchText, setSearchText] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  // Set initial selected customer when customers load and sort them
  useEffect(() => {
    if (customers.length > 0) {
      // Sort customers by status (active first) and then by name
      const sortedCustomers = [...customers].sort((a, b) => {
        // Active customers first
        if (a.status === "Y" && b.status !== "Y") return -1
        if (a.status !== "Y" && b.status === "Y") return 1

        // Then sort by name in ascending order by default
        return a.customerName.localeCompare(b.customerName)
      })

      // Set the first customer as selected by default
      setSelectedCustomer(sortedCustomers[0] ?? null)
    }
  }, [customers])

  // Fetch transactions when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      dispatch(
        fetchSalesByCustomerDetails(
          selectedCustomer.customerProfileId,
          selectedCustomer.customerName,
          selectedCustomer.customerEmail,
          currentPage,
          pageSize
        )
      )
    }
  }, [selectedCustomer, dispatch, currentPage, pageSize])

  // Filter and sort customers based on search text and sort direction
  const filteredCustomers = useMemo(() => {
    let result = [...customers]

    // Apply search filter
    if (searchText) {
      result = result.filter(
        (customer) =>
          customer.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.customerEmail.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.customerPhone.includes(searchText)
      )
    }

    // Sort by status (active first) and then by name
    return result.sort((a, b) => {
      // Active customers first
      if (a.status === "Y" && b.status !== "Y") return -1
      if (a.status !== "Y" && b.status === "Y") return 1

      // Then sort by name in the specified direction
      return sortDirection === "asc"
        ? a.customerName.localeCompare(b.customerName)
        : b.customerName.localeCompare(a.customerName)
    })
  }, [searchText, customers, sortDirection])

  const handleCancelSearch = useCallback(() => {
    setSearchText("")
  }, [])

  const handleCustomerClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer)
    setCurrentPage(0) // Reset to first page when selecting a new customer
  }, [])

  const handleRepeatOrder = useCallback(
    (orderId: string) => {
      router.push(`/sales/orders/create-order?repeatFrom=${orderId}`)
    },
    [router]
  )

  const handleViewInvoice = useCallback(() => {
    router.push(`transactions/invoice-detail`)
  }, [router])

  const toggleAddCustomer = useCallback(() => {
    setIsAddCustomerOpen((prev) => !prev)
  }, [])

  const toggleEditCustomer = useCallback(() => {
    setIsEditCustomerOpen((prev) => !prev)
  }, [])

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0) // Reset to first page when changing page size
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a")
    } catch {
      return dateString
    }
  }, [])

  if (loading) {
    return (
      <>
        <div className="mb-4 flex w-full justify-between">
          <div className="h-8 w-1/6 animate-pulse rounded-md bg-gray-200"></div>
          <div className="flex gap-4">
            <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200"></div>
            <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200"></div>
          </div>
        </div>
        <SkeletonLoader />
      </>
    )
  }

  if (error) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
        <div className="text-center">
          <EmptyState />
          <p className="text-xl font-bold text-[#D82E2E]">Failed to load customers.</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
        <EmptyState />
        <p className="text-base font-bold text-[#202B3C]">No customers found.</p>
        <ButtonModule variant="primary" size="sm" onClick={toggleAddCustomer}>
          Add New Customer
        </ButtonModule>
      </div>
    )
  }

  return (
    <>
      <AddCustomerModal isOpen={isAddCustomerOpen} onClose={toggleAddCustomer} />
      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        onClose={toggleEditCustomer}
        customer={selectedCustomer}
        onCustomerUpdated={() => window.location.reload()}
      />

      <div className="mb-4 flex w-full justify-between">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-semibold"
        >
          Customers
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex gap-4"
        >
          <ButtonModule
            variant="black"
            size="md"
            icon={<ExportIcon />}
            iconPosition="end"
            onClick={() => alert("Export clicked!")}
          >
            <p className="max-sm:hidden">Export</p>
          </ButtonModule>

          <ButtonModule variant="ghost" size="md" icon={<AddBusiness />} iconPosition="end" onClick={toggleAddCustomer}>
            <p className="max-sm:hidden">Add New Customer</p>
          </ButtonModule>
        </motion.div>
      </div>

      <div className="flex w-full items-start gap-4">
        {/* Customer List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-1/4 rounded-md bg-white p-4"
        >
          <div className="flex h-10 items-center gap-2">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              className="w-full rounded-md"
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <FilterIcon />
            </motion.div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">All Customers</p>
              <button className="flex items-center gap-2 text-sm text-gray-500" onClick={toggleSortDirection}>
                <RxCaretSort className={`transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                <span>Sort</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex h-[calc(100vh-420px)] flex-col gap-2 overflow-y-auto">
            <AnimatePresence>
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.customerProfileId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`cursor-pointer rounded-md p-3 text-sm ${
                    selectedCustomer?.customerProfileId === customer.customerProfileId
                      ? "bg-[#e6f7f7] text-[#00a4a6]"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleCustomerClick(customer)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-2 rounded-full ${customer.status === "Y" ? "bg-green-500" : "bg-red-500"}`} />
                    <div>
                      <p className="font-medium">{customer.customerName}</p>
                      <p className="text-xs text-gray-500">{customer.customerEmail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Customer Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-3/4 rounded-md bg-white p-4"
        >
          {selectedCustomer ? (
            <div>
              <div className="mb-6 border-b pb-4">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <motion.h2
                        className="text-xl font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {selectedCustomer.customerName}
                      </motion.h2>
                      <motion.div
                        className="cursor-pointer"
                        onClick={toggleEditCustomer}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <EditIcon />
                      </motion.div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                          selectedCustomer.status === "Y" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            selectedCustomer.status === "Y" ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        {selectedCustomer.status === "Y" ? "Active" : "Inactive"}
                      </div>
                      <div
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                          selectedCustomer.subscriptionOpt === "Individual"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {selectedCustomer.subscriptionOpt || "Individual"}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="flex items-center gap-2 rounded-full bg-[#e6f7f7] p-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <NotificationIcon />
                    <p className="text-sm text-[#00a4a6]">Send Payment Reminder</p>
                  </motion.div>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                    <div className="my-2 flex items-center gap-2">
                      <MessageIcon />
                      <p>{selectedCustomer.customerEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <WhatsappIcon />
                      <p>{selectedCustomer.customerPhone}</p>
                    </div>
                    <p className="mt-2 text-sm">Loyalty Points: {selectedCustomer.customerLoyaltyPoints}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <h3 className="my-2 text-sm font-medium text-gray-500">Address</h3>
                    <div className="flex items-center gap-2">
                      <LocationIcon />
                      <p className="mt-1">{selectedCustomer.customerAddress}</p>
                    </div>
                    {selectedCustomer.gstin && (
                      <>
                        <h3 className="mt-3 text-sm font-medium text-gray-500">GSTIN</h3>
                        <p className="mt-1">{selectedCustomer.gstin}</p>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
                {customerSales.loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="animate-pulse rounded-lg border bg-gray-50 p-4">
                        <div className="flex justify-between">
                          <div className="h-5 w-32 rounded bg-gray-200"></div>
                          <div className="h-5 w-20 rounded bg-gray-200"></div>
                        </div>
                        <div className="mt-3 size-48 rounded bg-gray-200"></div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-4 w-16 rounded bg-gray-200"></div>
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : customerSales.error ? (
                  <motion.div
                    className="flex w-full flex-col items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmptyState />
                    <p>Error loading transactions: {customerSales.error}.</p>
                    <Link href="/sales/orders/create-order">
                      <ButtonModule variant="primary" size="sm">
                        <p className="max-sm:hidden">Create Order</p>
                      </ButtonModule>
                    </Link>
                  </motion.div>
                ) : customerSales.pagination.totalElements > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            S/N
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Invoice #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        <AnimatePresence>
                          {customerSales.data.map((order, index) => (
                            <motion.tr
                              key={order.saleOrderId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {index + 1 + currentPage * pageSize}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {formatDate(order.createdDate)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {order.saleOrderInvoiceNo}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="flex flex-col">
                                  {order.saleOrderItems.map((item, i) => (
                                    <span key={i}>
                                      {item.quantity}x {item.itemName} (₹{item.pricePerUnit.toFixed(2)})
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                ₹{order.paidAmount.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(order.orderStatus)}`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                <motion.button
                                  onClick={() => handleRepeatOrder(order.saleOrderId.toString())}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Repeat
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>

                    {/* Pagination controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          className="rounded-md border border-gray-300 bg-white p-1 text-sm"
                        >
                          {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {currentPage * pageSize + 1}-
                          {Math.min((currentPage + 1) * pageSize, customerSales.pagination.totalElements)} of{" "}
                          {customerSales.pagination.totalElements}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className={`rounded-md p-1 ${
                              currentPage === 0 ? "text-gray-400" : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <FaArrowLeft size={18} />
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= customerSales.pagination.totalPages - 1}
                            className={`rounded-md p-1 ${
                              currentPage >= customerSales.pagination.totalPages - 1
                                ? "text-gray-400"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <FaArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      className="mt-4 flex w-full justify-end gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <ButtonModule variant="ghost" size="sm" icon={<CardPosIcon />} iconPosition="start">
                        <p className="max-sm:hidden">Make Payment</p>
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (selectedCustomer) {
                            dispatch(
                              fetchSalesByCustomerDetails(
                                selectedCustomer.customerProfileId,
                                selectedCustomer.customerName,
                                selectedCustomer.customerEmail,
                                currentPage,
                                pageSize
                              )
                            )
                          }
                        }}
                      >
                        <p className="max-sm:hidden">Refresh</p>
                      </ButtonModule>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    className="flex w-full flex-col items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmptyState />
                    <p>No recent transactions found for this customer.</p>
                    <ButtonModule variant="primary" size="sm" onClick={handleViewInvoice}>
                      <p className="max-sm:hidden">Create Order</p>
                    </ButtonModule>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <motion.div
              className="flex h-full items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500">Select a customer to view details</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default CustomerTable
