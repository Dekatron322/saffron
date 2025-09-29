"use client"

import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter } from "next/navigation"
import AddBusiness from "public/add-business"
import CardPosIcon from "public/card-pos-icon"
import ExportIcon from "public/export-icon"
import FilterIcon from "public/Icons/filter-icon"
import EmptyState from "public/empty-state"
import React, { useState, useEffect, useCallback } from "react"
import AddCustomerModal from "../Modal/add-customer-modal"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { fetchAllCustomers, selectCustomers, fetchSalesByCustomerDetails } from "app/api/store/customerSlice"
import EditIcon from "public/edit-icon"
import EditCustomerModal from "../Modal/edit-customer-modal"
import MessageIcon from "public/messages"
import WhatsappIcon from "public/whatsapp"
import ReminderIcon from "public/reminder"
import { motion, AnimatePresence } from "framer-motion"
import LocationIcon from "public/location"
import NotificationIcon from "public/notification-icon"
import { format } from "date-fns"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"

const SkeletonLoader = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full items-start gap-4">
      <div className="w-1/4 rounded-md bg-white p-4">
        <div className="flex h-10 items-center gap-2">
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-6 w-6 animate-pulse rounded-md bg-gray-200"></div>
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

const CustomerTab = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { customers, loading, error, pagination, customerSales } = useAppSelector(selectCustomers)

  const [searchText, setSearchText] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  // Fetch customers when component mounts
  useEffect(() => {
    dispatch(fetchAllCustomers(0, 10))
  }, [dispatch])

  // Set initial selected customer when customers are loaded
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0])
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

  // Filter customers based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = customers.filter(
        (customer: any) =>
          customer.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.customerEmail.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.customerPhone.includes(searchText)
      )
      setFilteredCustomers(filtered)

      // Update selected customer if it's no longer in filtered list
      if (selectedCustomer && !filtered.some((c) => c.customerProfileId === selectedCustomer.customerProfileId)) {
        setSelectedCustomer(filtered.length > 0 ? filtered[0] : null)
      }
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchText, customers, selectedCustomer])

  const handleCancelSearch = useCallback(() => {
    setSearchText("")
    setFilteredCustomers(customers)
  }, [customers])

  const handleCustomerClick = useCallback((customer: any) => {
    setSelectedCustomer(customer)
    setCurrentPage(0) // Reset to first page when selecting a new customer
  }, [])

  const handleRepeatOrder = useCallback((orderId: string) => {
    console.log(`Repeating order ${orderId}`)
  }, [])

  const handleViewInvoice = useCallback(() => {
    router.push(`transactions/invoice-detail`)
  }, [router])

  const toggleAddCustomer = useCallback(() => {
    setIsAddCustomerOpen((prev) => !prev)
  }, [])

  const toggleEditCustomer = useCallback(() => {
    setIsEditCustomerOpen((prev) => !prev)
  }, [])

  const handleCustomerUpdated = useCallback(() => {
    dispatch(fetchAllCustomers(0, 10))
  }, [dispatch])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
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

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0) // Reset to first page when changing page size
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
    return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
  }

  return (
    <>
      <AddCustomerModal isOpen={isAddCustomerOpen} onClose={toggleAddCustomer} />
      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        onClose={toggleEditCustomer}
        customer={selectedCustomer}
        onCustomerUpdated={handleCustomerUpdated}
      />

      <div className="mb-4 flex w-full justify-between">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-semibold"
        >
          Customer
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
            onClick={() => alert("Button clicked!")}
          >
            <p className="max-sm:hidden">Export</p>
          </ButtonModule>

          <ButtonModule variant="ghost" size="md" icon={<AddBusiness />} iconPosition="end" onClick={toggleAddCustomer}>
            <p className="max-sm:hidden">Add New Customer</p>
          </ButtonModule>
        </motion.div>
      </div>
      <div className="flex w-full items-start gap-4">
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
            <p className="text-lg font-semibold">Recent Customers</p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {filteredCustomers.map((customer: any) => (
              <motion.div
                key={customer.customerProfileId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`cursor-pointer rounded-md p-2 text-sm ${
                  selectedCustomer?.customerProfileId === customer.customerProfileId
                    ? "bg-[#e6f7f7] text-[#00a4a6]"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleCustomerClick(customer)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-medium">{customer.customerName}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
                    <div className="flex items-center  gap-2">
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

              <h2 className="mb-4 border-b text-lg font-semibold">Recent Transactions</h2>
              {customerSales.loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="animate-pulse rounded-lg border bg-gray-50 p-4">
                      <div className="flex justify-between">
                        <div className="h-5 w-32 rounded bg-gray-200"></div>
                        <div className="h-5 w-20 rounded bg-gray-200"></div>
                      </div>
                      <div className="mt-3 h-4 w-48 rounded bg-gray-200"></div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-4 w-16 rounded bg-gray-200"></div>
                        <div className="h-4 w-24 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : customerSales.error ? (
                <div className="flex h-40 items-center justify-center text-red-500">{customerSales.error}</div>
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
                  <ButtonModule variant="primary" size="sm" onClick={() => handleViewInvoice()}>
                    <p className="max-sm:hidden">Create Order</p>
                  </ButtonModule>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              className="flex h-full items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500">No customers found</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default CustomerTab
