"use client"

import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import { useRouter } from "next/navigation"
import AddBusiness from "public/add-business"
import CardPosIcon from "public/card-pos-icon"
import ExportIcon from "public/export-icon"
import FilterIcon from "public/Icons/filter-icon"
import EmptyState from "public/empty-state"
import React, { useCallback, useEffect, useState } from "react"
import AddCustomerModal from "../Modal/add-customer-modal"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  createWallet,
  fetchAllCustomers,
  fetchCustomerById,
  fetchSalesByCustomerDetails,
  selectCustomers,
  updateWallet,
} from "app/api/store/customerSlice"
import EditIcon from "public/edit-icon"
import EditCustomerModal from "../Modal/edit-customer-modal"
import MessageIcon from "public/messages"
import WhatsappIcon from "public/whatsapp"
import { AnimatePresence, motion } from "framer-motion"
import LocationIcon from "public/location"
import NotificationIcon from "public/notification-icon"
import { format } from "date-fns"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import WalletModal from "components/ui/Modal/wallet-modal"
import { notify } from "components/ui/Notification/Notification"
import Link from "next/link"

interface WalletData {
  customerId: number
  date: string
  paymentType: string
  amount: number
  description: string
  receivedAmount: number
}

const SkeletonLoader = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full items-start gap-4">
      {/* Left sidebar skeleton */}
      <div className="w-1/4 rounded-md bg-white p-4">
        <div className="flex h-10 items-center gap-2">
          <div className="h-10 w-full rounded-md bg-gray-200">
            <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
          </div>
          <div className="size-6 rounded-md bg-gray-200">
            <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-6 w-3/4 rounded-md bg-gray-200">
            <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-md bg-gray-200">
              <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right content skeleton */}
      <div className="w-3/4 rounded-md bg-white p-4">
        {/* Customer header skeleton */}
        <div className="mb-6 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-1/3 rounded-md bg-gray-200">
              <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
            </div>
            <div className="h-8 w-32 rounded-md bg-gray-200">
              <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="h-4 w-1/2 rounded-md bg-gray-200">
                <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
              </div>
              <div className="h-4 w-3/4 rounded-md bg-gray-200">
                <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
              </div>
              <div className="h-4 w-1/2 rounded-md bg-gray-200">
                <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-1/2 rounded-md bg-gray-200">
                <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
              </div>
              <div className="h-4 w-3/4 rounded-md bg-gray-200">
                <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
              </div>
              <div className="h-4 w-2/3 rounded-md bg-gray-200">
                <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions header skeleton */}
        <div className="mb-4 h-6 w-1/3 rounded-md bg-gray-200">
          <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          {/* Table header skeleton */}
          <div className="mb-2 flex space-x-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 flex-1 rounded-md bg-gray-200">
                <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
              </div>
            ))}
          </div>

          {/* Table rows skeleton */}
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="h-12 flex-1 rounded-md bg-gray-200">
                    <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
                  </div>
                ))}
              </div>
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

  // Wallet states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [selectedCustomerForWallet, setSelectedCustomerForWallet] = useState<any>(null)
  const [walletAction, setWalletAction] = useState<"create" | "update">("create")
  const [existingWalletId, setExistingWalletId] = useState<number | null>(null)
  const [customerWalletStatus, setCustomerWalletStatus] = useState<{ [key: number]: boolean }>({})

  // Fetch customers when component mounts
  useEffect(() => {
    dispatch(fetchAllCustomers(0, 1000))
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
      console.log("Selected customer changed, fetching sales:", {
        customerId: selectedCustomer.customerProfileId,
        customerName: selectedCustomer.customerName,
        customerEmail: selectedCustomer.customerEmail,
        currentPage,
        pageSize,
      })

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

  // Check wallet status for selected customer
  useEffect(() => {
    const checkWalletStatus = async () => {
      if (selectedCustomer) {
        try {
          const customerDetails = await dispatch(fetchCustomerById(selectedCustomer.customerProfileId))
          const walletAmount = customerDetails.walletAmt || 0
          setCustomerWalletStatus((prev) => ({
            ...prev,
            [selectedCustomer.customerProfileId]: walletAmount > 0,
          }))
        } catch (error) {
          console.error("Failed to fetch wallet status:", error)
          setCustomerWalletStatus((prev) => ({
            ...prev,
            [selectedCustomer.customerProfileId]: false,
          }))
        }
      }
    }

    checkWalletStatus()
  }, [selectedCustomer, dispatch])

  // Function to generate pagination buttons with ellipsis - EXACT SAME AS AllCustomers
  const getPaginationButtons = () => {
    const totalPages = customerSales.pagination.totalPages
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
      let startPage = Math.max(2, currentPage + 1 - 1) // currentPage is 0-based, so convert to 1-based for calculation
      let endPage = Math.min(totalPages - 1, currentPage + 1 + 1)

      // Adjust if we're at the beginning
      if (currentPage + 1 <= 3) {
        // Convert to 1-based for comparison
        endPage = 4
      }

      // Adjust if we're at the end
      if (currentPage + 1 >= totalPages - 2) {
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

  // Debug logging
  console.log("Customer Sales State:", {
    data: customerSales.data,
    loading: customerSales.loading,
    error: customerSales.error,
    pagination: customerSales.pagination,
  })

  const handleCancelSearch = useCallback(() => {
    setSearchText("")
    setFilteredCustomers(customers)
  }, [customers])

  const handleCustomerClick = useCallback((customer: any) => {
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

  const handleCustomerUpdated = useCallback(() => {
    dispatch(fetchAllCustomers(0, 1000))
  }, [dispatch])

  // Wallet functions
  const handleWalletAction = async () => {
    if (!selectedCustomer) return

    try {
      // Fetch the latest customer details to get walletAmt
      const customerDetails = await dispatch(fetchCustomerById(selectedCustomer.customerProfileId))
      const walletAmount = customerDetails.walletAmt || 0

      // Determine wallet action based on wallet amount
      const hasWallet = walletAmount > 0
      setWalletAction(hasWallet ? "update" : "create")
      setSelectedCustomerForWallet(selectedCustomer)

      // For update, we need to get the existing wallet ID
      // Since we don't have it in the customer response, we'll use customer ID as a fallback
      setExistingWalletId(hasWallet ? selectedCustomer.customerProfileId : null)

      setIsWalletModalOpen(true)
    } catch (error) {
      console.error("Failed to fetch customer details for wallet:", error)
      notify("error", "Failed to check wallet status", {
        title: "Error",
        description: "Could not determine wallet status for this customer",
      })
    }
  }

  const handleCreateWallet = async (walletData: WalletData) => {
    try {
      const result = await dispatch(createWallet(walletData))
      setIsWalletModalOpen(false)
      notify("success", "Wallet created successfully!", {
        title: "Success",
        description: `Wallet has been created for ${selectedCustomerForWallet?.customerName}.`,
      })
      // Refresh wallet status after creation
      if (selectedCustomer) {
        setCustomerWalletStatus((prev) => ({
          ...prev,
          [selectedCustomer.customerProfileId]: true,
        }))
      }
      return result
    } catch (error) {
      console.error("Failed to create wallet:", error)
      throw error
    }
  }

  const handleUpdateWallet = async (walletData: WalletData) => {
    if (!existingWalletId) return

    try {
      const result = await dispatch(updateWallet(existingWalletId, walletData))
      setIsWalletModalOpen(false)
      notify("success", "Wallet updated successfully!", {
        title: "Success",
        description: `Wallet has been updated for ${selectedCustomerForWallet?.customerName}.`,
      })
      return result
    } catch (error) {
      console.error("Failed to update wallet:", error)
      throw error
    }
  }

  const handleWalletSubmit = async (walletData: WalletData) => {
    try {
      if (walletAction === "create") {
        return await handleCreateWallet(walletData)
      } else {
        return await handleUpdateWallet(walletData)
      }
    } catch (error: any) {
      // Handle "wallet already exists" error by switching to update mode
      if (error.message && error.message.includes("Wallet already exists for customer")) {
        setWalletAction("update")
        setExistingWalletId(walletData.customerId)
        notify("info", "Wallet already exists. Switching to update mode.", {
          title: "Wallet Exists",
          description: "This customer already has a wallet. Please update the wallet instead.",
        })
        // Re-throw the error to prevent closing the modal
        throw error
      }
      throw error
    }
  }

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

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber - 1) // Convert 1-based to 0-based
  }

  if (loading) {
    return (
      <>
        <div className="mb-4 flex w-full justify-between">
          <div className="h-8 w-1/6 rounded-md bg-gray-200">
            <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-24 rounded-md bg-gray-200">
              <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
            </div>
            <div className="h-10 w-40 rounded-md bg-gray-200">
              <div className="size-full animate-pulse rounded-md bg-gray-300"></div>
            </div>
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

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSubmit={handleWalletSubmit}
        customer={selectedCustomerForWallet}
        action={walletAction}
        existingWalletId={existingWalletId}
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
            onClick={() => alert("Export functionality")}
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
          className="flex h-[600px] w-1/4 flex-col rounded-lg bg-white p-4 shadow"
        >
          <div className="mb-4">
            <h2 className="mb-3 text-lg font-semibold">All Customers</h2>
            <div className="flex items-center gap-2">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search customers..."
                className="w-full rounded-md"
              />
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <FilterIcon />
              </motion.div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer: any) => (
                <motion.div
                  key={customer.customerProfileId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-3 flex w-full cursor-pointer items-start justify-between rounded-md border p-3 text-sm hover:bg-gray-50 ${
                    selectedCustomer?.customerProfileId === customer.customerProfileId
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleCustomerClick(customer)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div>
                    <div className="font-medium">{customer.customerName}</div>
                    {customer.customerEmail && <div className="text-xs text-gray-600">{customer.customerEmail}</div>}
                    {customer.customerPhone && <div className="text-xs text-gray-600">{customer.customerPhone}</div>}
                  </div>
                  {customer.walletAmt > 0 && (
                    <div className="rounded-md bg-green-200 px-2 py-1 text-xs font-medium text-green-700">
                      ₹{customer.walletAmt.toFixed(2)}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                {searchText ? "No matching customers found" : "No customers found"}
              </div>
            )}
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

                  <div className="flex items-center gap-2">
                    {/* Wallet Button */}
                    <motion.div
                      className="flex items-center gap-2 rounded-full bg-[#e6f7f7] p-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <NotificationIcon />
                      <p className="text-sm text-[#00a4a6]">Send Payment Reminder</p>
                    </motion.div>
                    <ButtonModule variant="primary" size="sm" onClick={handleWalletAction}>
                      {selectedCustomer.walletAmt > 0 ? "Update Wallet" : "Create Wallet"}
                    </ButtonModule>
                  </div>
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
                    {selectedCustomer.walletAmt > 0 && (
                      <p className="mt-1 text-sm font-medium text-green-600">
                        Wallet Balance: ₹{selectedCustomer.walletAmt}
                      </p>
                    )}
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
                    <div key={item} className="rounded-lg border bg-gray-50 p-4">
                      <div className="flex justify-between">
                        <div className="h-5 w-32 rounded bg-gray-200">
                          <div className="size-full animate-pulse rounded bg-gray-300"></div>
                        </div>
                        <div className="h-5 w-20 rounded bg-gray-200">
                          <div className="size-full animate-pulse rounded bg-gray-300"></div>
                        </div>
                      </div>
                      <div className="mt-3 h-12 rounded bg-gray-200">
                        <div className="size-full animate-pulse rounded bg-gray-300"></div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-4 w-16 rounded bg-gray-200">
                          <div className="size-full animate-pulse rounded bg-gray-300"></div>
                        </div>
                        <div className="h-4 w-24 rounded bg-gray-200">
                          <div className="size-full animate-pulse rounded bg-gray-300"></div>
                        </div>
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
              ) : customerSales.data && customerSales.data.length > 0 ? (
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
                          Payment Type
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
                              <div className="flex max-w-xs flex-col">
                                {order.saleOrderItems &&
                                  order.saleOrderItems.map((item, i) => (
                                    <span key={i} className="truncate">
                                      {item.quantity}x {item.itemName} (₹{item.pricePerUnit?.toFixed(2) || "0.00"})
                                    </span>
                                  ))}
                                {(!order.saleOrderItems || order.saleOrderItems.length === 0) && (
                                  <span className="text-gray-400">No items</span>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              ₹{order.paidAmount?.toFixed(2) || "0.00"}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {order.paymentTypeId === 1
                                ? "Cash"
                                : order.paymentTypeId === 2
                                ? "Card"
                                : order.paymentTypeId === 3
                                ? "UPI"
                                : order.paymentTypeId === 4
                                ? "Wallet"
                                : "Other"}
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

                  {/* EXACT SAME PAGINATION STYLE AS AllCustomers */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between border-t px-4 py-3"
                  >
                    <div className="text-sm text-gray-700">
                      Showing {currentPage * pageSize + 1} to{" "}
                      {Math.min((currentPage + 1) * pageSize, customerSales.pagination.totalElements)} of{" "}
                      {customerSales.pagination.totalElements} entries
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => paginate(currentPage + 1)} // currentPage is 0-based, so +1 gives 1-based
                        disabled={currentPage === 0}
                        className={`rounded-full px-2 py-1 ${
                          currentPage === 0
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
                            onClick={() => paginate(page as number)}
                            className={`rounded-full px-3 py-1 ${
                              currentPage + 1 === page ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            {page}
                          </motion.button>
                        )
                      })}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => paginate(currentPage + 2)} // currentPage is 0-based, so +2 gives next page in 1-based
                        disabled={currentPage >= customerSales.pagination.totalPages - 1}
                        className={`rounded-full px-2 py-1 ${
                          currentPage >= customerSales.pagination.totalPages - 1
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        <MdOutlineArrowForwardIos />
                      </motion.button>
                    </div>
                  </motion.div>

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
                  className="flex w-full flex-col items-center justify-center gap-3 py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <EmptyState />
                  <p className="text-gray-500">No recent transactions found for this customer.</p>
                  <ButtonModule variant="primary" size="sm" onClick={() => handleViewInvoice()}>
                    <p className="max-sm:hidden">Create Order</p>
                  </ButtonModule>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              className="flex h-full items-center justify-center py-8"
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

export default CustomerTab
