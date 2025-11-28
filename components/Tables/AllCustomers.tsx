import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import AddBusiness from "public/add-business"
import CustomerMenu from "components/ui/CardMenu/customer-menu"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import EditCustomerModal from "components/ui/Modal/edit-customer-modal"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import { useRouter } from "next/navigation"
import {
  deleteCustomer,
  fetchAllCustomers,
  selectCustomers,
  createWallet,
  updateWallet,
  fetchCustomerById,
} from "app/api/store/customerSlice"
import DeleteCustomerModal from "components/ui/Modal/delete-customer-modal"
import CustomerDetailsModal from "components/ui/Modal/customer-details-modal"
import { AnimatePresence, motion } from "framer-motion"
import ArrowIcon from "public/Icons/arrowIcon"
import WalletModal from "components/ui/Modal/wallet-modal"
import { notify } from "components/ui/Notification/Notification"

type SortOrder = "asc" | "desc" | null
type Order = {
  sn: number
  customerName: string
  customerEmail: string
  customerPhone: string
  type: string
  status: string
  totalOrders: string
}

interface WalletData {
  customerId: number
  date: string
  paymentType: string
  amount: number
  description: string
  receivedAmount: number
}

const SkeletonRow = () => {
  return (
    <tr>
      {[...Array(8)].map((_, index) => (
        <td key={index} className="whitespace-nowrap border-b px-4 py-2 text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-6 w-full animate-pulse rounded bg-gray-200"
          ></motion.div>
        </td>
      ))}
    </tr>
  )
}

const exportToCSV = (data: any[], filename: string) => {
  const headers = ["SN", "Customer Name", "Email", "Phone Number", "Type", "Status", "Total Orders"]
  const rows = data.map((customer) => [
    customer.customerProfileId,
    `"${customer.customerName}"`,
    `"${customer.customerEmail}"`,
    `"${customer.customerPhone}"`,
    `"${customer.subscriptionOpt || "Individual"}"`,
    `"${customer.status === "Y" ? "Active" : "Inactive"}"`,
    `"0"`,
  ])
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const AllCustomers = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { customers, loading, error, pagination } = useAppSelector(selectCustomers)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false)

  // Wallet states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [selectedCustomerForWallet, setSelectedCustomerForWallet] = useState<any>(null)
  const [walletAction, setWalletAction] = useState<"create" | "update">("create")
  const [existingWalletId, setExistingWalletId] = useState<number | null>(null)
  const [customerWalletStatus, setCustomerWalletStatus] = useState<{ [key: number]: boolean }>({})

  // Create a ref for wallet functions to use in DropdownMenu
  const walletActionsRef = useRef({
    setIsWalletModalOpen,
    setSelectedCustomerForWallet,
    setWalletAction,
    setExistingWalletId,
    customers,
  })

  // Update ref when state changes
  useEffect(() => {
    walletActionsRef.current = {
      setIsWalletModalOpen,
      setSelectedCustomerForWallet,
      setWalletAction,
      setExistingWalletId,
      customers,
    }
  }, [setIsWalletModalOpen, setSelectedCustomerForWallet, setWalletAction, setExistingWalletId, customers])

  const DropdownMenu = React.memo(
    ({ order, onClose, onEdit }: { order: Order; onClose: () => void; onEdit: () => void }) => {
      const handleDelete = () => {
        setCustomerToDelete({ id: order.sn, name: order.customerName })
        setIsDeleteModalOpen(true)
        onClose()
      }

      const handleViewDetails = () => {
        setSelectedCustomerId(order.sn)
        setIsDetailsModalOpen(true)
        onClose()
      }

      const handleEdit = () => {
        onEdit()
        onClose()
      }

      const handleWalletAction = async () => {
        const { customers, setIsWalletModalOpen, setSelectedCustomerForWallet, setWalletAction, setExistingWalletId } =
          walletActionsRef.current

        const customer = customers.find((c) => c.customerProfileId === order.sn)
        if (customer) {
          // Open modal immediately and default to create; refine after async fetch
          setSelectedCustomerForWallet(customer)
          setWalletAction("create")
          setExistingWalletId(null)
          setIsWalletModalOpen(true)

          try {
            // Fetch the latest customer details to get walletAmt - SINGLE API CALL
            const customerDetails = await dispatch(fetchCustomerById(order.sn))

            if (customerDetails) {
              const walletAmount = customerDetails.walletAmt || 0

              // Determine wallet action based on wallet amount
              const hasWallet = walletAmount > 0
              setWalletAction(hasWallet ? "update" : "create")

              // For update, we need to get the existing wallet ID
              setExistingWalletId(hasWallet ? order.sn : null)
            }
          } catch (error) {
            console.error("Failed to fetch customer details for wallet:", error)
            notify("error", "Failed to check wallet status", {
              title: "Error",
              description: "Could not determine wallet status for this customer",
            })
          }
        }
        onClose()
      }

      // Check if customer has wallet based on walletAmt
      const hasWallet = customerWalletStatus[order.sn] || false

      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            <motion.button
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewDetails}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700"
            >
              View Details
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEdit}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700"
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWalletAction}
              className="block w-full px-4 py-2 text-left text-sm text-blue-600"
            >
              {hasWallet ? "Update Wallet" : "Create Wallet"}
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              className="block w-full px-4 py-2 text-left text-sm text-red-600"
            >
              Deactivate
            </motion.button>
          </div>
        </motion.div>
      )
    }
  )

  // Fix: Add displayName to the memoized component
  DropdownMenu.displayName = "DropdownMenu"

  // SIMPLIFIED: Check wallet status from customer data directly without additional API calls
  const checkCustomerWallets = useCallback(() => {
    const walletStatus: { [key: number]: boolean } = {}

    // Use existing customer data to determine wallet status
    customers.forEach((customer) => {
      // Assuming walletAmt is included in the customer data from fetchAllCustomers
      const walletAmount = customer.walletAmt || 0
      walletStatus[customer.customerProfileId] = walletAmount > 0
    })

    setCustomerWalletStatus(walletStatus)
  }, [customers])

  useEffect(() => {
    if (customers.length > 0) {
      checkCustomerWallets()
    }
  }, [customers, checkCustomerWallets])

  const handleDeleteConfirmation = async (reason: string) => {
    if (!customerToDelete) return

    try {
      setIsDeleting(true)
      await dispatch(deleteCustomer(customerToDelete.id))
      dispatch(fetchAllCustomers(currentPage - 1, itemsPerPage))
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Failed to delete customer:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // SINGLE useEffect for fetching customers - handles both initial load and page changes
  useEffect(() => {
    const controller = new AbortController()

    // Fetch customers with current page and items per page
    dispatch(fetchAllCustomers(currentPage - 1, itemsPerPage, controller.signal))

    return () => {
      controller.abort()
    }
  }, [dispatch, currentPage, itemsPerPage]) // Only depend on these stable values

  useEffect(() => {
    if (!loading) {
      setHasCompletedInitialLoad(true)
    }
  }, [loading])

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

  const getPaymentStyle = useCallback((status: string) => {
    switch (status) {
      case "Paid":
      case "Active":
      case "Y":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Inactive":
      case "N":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }, [])

  const toggleSort = useCallback(
    (column: keyof Order) => {
      const isAscending = sortColumn === column && sortOrder === "asc"
      setSortOrder(isAscending ? "desc" : "asc")
      setSortColumn(column)
    },
    [sortColumn, sortOrder]
  )

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleSeeMore = () => {
    router.push(`/customers/all-customers`)
  }

  const toggleAddCustomer = () => {
    setIsAddCustomerOpen((prev) => !prev)
  }

  const handleEditCustomer = useCallback(
    (customerId: number) => {
      const customerToEdit = customers.find((c) => c.customerProfileId === customerId)
      if (customerToEdit) {
        setSelectedCustomer(customerToEdit)
        setIsEditCustomerOpen(true)
      }
    },
    [customers]
  )

  const handleExport = () => {
    const dataToExport = searchText ? filteredCustomers : customers
    exportToCSV(dataToExport, "customers_export.csv")
  }

  // Wallet functions
  const handleCreateWallet = async (walletData: WalletData) => {
    try {
      const result = await dispatch(createWallet(walletData))
      setIsWalletModalOpen(false)
      // REMOVED: notify call from here
      // Refresh wallet status after creation
      checkCustomerWallets()
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
      // REMOVED: notify call from here
      // Refresh wallet status after update
      checkCustomerWallets()
      return result
    } catch (error) {
      console.error("Failed to update wallet:", error)
      throw error
    }
  }

  const handleWalletSubmit = async (walletData: WalletData) => {
    try {
      let result
      if (walletAction === "create") {
        result = await handleCreateWallet(walletData)
        // Add success notification HERE only
        notify("success", "Wallet created successfully!", {
          title: "Success",
          description: `Wallet has been created for ${selectedCustomerForWallet?.customerName}.`,
        })
      } else {
        result = await handleUpdateWallet(walletData)
        // Add success notification HERE only
        notify("success", "Wallet updated successfully!", {
          title: "Success",
          description: `Wallet has been updated for ${selectedCustomerForWallet?.customerName}.`,
        })
      }
      return result
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

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      Object.values(customer).some((value) => {
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchText.toLowerCase())
      })
    )
  }, [customers, searchText])

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Function to generate pagination buttons with ellipsis
  const getPaginationButtons = () => {
    const totalPages = pagination.totalPages
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

  // Debug: log when wallet modal state changes
  useEffect(() => {
    console.log("Wallet modal state:", isWalletModalOpen)
  }, [isWalletModalOpen])

  return (
    <>
      <AddCustomerModal isOpen={isAddCustomerOpen} onClose={toggleAddCustomer} />
      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        customer={selectedCustomer}
        onCustomerUpdated={() => {
          dispatch(fetchAllCustomers(currentPage - 1, itemsPerPage))
          checkCustomerWallets()
        }}
      />

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onSubmit={handleWalletSubmit}
          customer={selectedCustomerForWallet}
          action={walletAction}
          existingWalletId={existingWalletId}
        />
      )}

      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirmation}
        loading={isDeleting}
        customerName={customerToDelete?.name || ""}
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        customerId={selectedCustomerId}
        onRequestClose={() => setIsDetailsModalOpen(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex w-full justify-between"
      >
        <p className="text-xl font-semibold">Customers</p>
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ButtonModule variant="black" size="md" icon={<ExportIcon />} iconPosition="end" onClick={handleExport}>
              <p className="max-sm:hidden">Export</p>
            </ButtonModule>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ButtonModule
              variant="ghost"
              size="md"
              icon={<AddBusiness />}
              iconPosition="end"
              onClick={toggleAddCustomer}
            >
              <p className="max-sm:hidden"> Add New Customer</p>
            </ButtonModule>
          </motion.div>
        </motion.div>
      </motion.div>

      <CustomerMenu />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5"
      >
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">Customers</p>
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ButtonModule variant="ghost" size="md" onClick={handleSeeMore} icon={<ArrowIcon />} iconPosition="end">
                <p className="whitespace-nowrap max-sm:hidden"> See More</p>
              </ButtonModule>
            </motion.div>
          </motion.div>
        </div>

        {loading || !hasCompletedInitialLoad ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full overflow-x-auto border-l border-r"
          >
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      SN <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">
                      Customer ID <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">
                      Customer Name <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">
                      Email <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">
                      Phone No. <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">
                      Type <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                    <div className="flex items-center gap-2">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : error && customers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]"
          >
            <div className="text-center">
              <EmptyState />
              <p className="text-xl font-bold text-[#D82E2E]">Failed to load customers.</p>
              <p>{error}</p>
            </div>
          </motion.div>
        ) : filteredCustomers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]"
          >
            <EmptyState />
            <p className="text-base font-bold text-[#202B3C]">No customers found.</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full overflow-x-auto border-l border-r"
            >
              <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("customerName")}
                    >
                      <div className="flex items-center gap-2">
                        Customer ID <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("customerName")}
                    >
                      <div className="flex items-center gap-2">
                        Customer Name <RxCaretSort />
                      </div>
                    </th>

                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("customerEmail")}
                    >
                      <div className="flex items-center gap-2">
                        Email <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("customerPhone")}
                    >
                      <div className="flex items-center gap-2">
                        Phone No. <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("type")}
                    >
                      <div className="flex items-center gap-2">
                        Type <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.customerProfileId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">{customer.customerProfileId}</div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">{customer.customerName}</div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">{customer.customerEmail}</div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">{customer.customerPhone}</div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                          <div className="flex">
                            <motion.div
                              style={getPaymentStyle(customer.subscriptionOpt || "Individual")}
                              className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                              whileHover={{ scale: 1.05 }}
                            >
                              {customer.subscriptionOpt || "Individual"}
                            </motion.div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                          <div className="flex">
                            <motion.div
                              className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 ${
                                customer.status === "Y" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              <span
                                className={`size-2 rounded-full ${
                                  customer.status === "Y" ? "bg-green-500" : "bg-red-500"
                                }`}
                              ></span>
                              {customer.status === "Y" ? "Active" : "Inactive"}
                            </motion.div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                          <div
                            className="relative flex items-center gap-2"
                            ref={(el) => {
                              dropdownRefs.current[index] = el
                            }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleDropdown(index)}
                              className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
                            >
                              <RxDotsVertical />
                            </motion.button>
                            <AnimatePresence>
                              {activeDropdown === index && (
                                <DropdownMenu
                                  order={{
                                    sn: customer.customerProfileId,
                                    customerName: customer.customerName,
                                    customerEmail: customer.customerEmail,
                                    customerPhone: customer.customerPhone,
                                    type: customer.subscriptionOpt || "Individual",
                                    status: customer.status === "Y" ? "Active" : "Inactive",
                                    totalOrders: "0",
                                  }}
                                  onClose={() => setActiveDropdown(null)}
                                  onEdit={() => handleEditCustomer(customer.customerProfileId)}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between border-t px-4 py-3"
            >
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, pagination.totalElements)} of {pagination.totalElements} entries
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`rounded-full px-2 py-1 ${
                    currentPage === 1 ? "cursor-not-allowed bg-gray-200 text-gray-500" : "bg-gray-200 hover:bg-gray-300"
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
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className={`rounded-full px-2 py-1 ${
                    currentPage === pagination.totalPages
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
    </>
  )
}

export default AllCustomers
