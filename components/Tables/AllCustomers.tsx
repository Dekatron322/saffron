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
import { deleteCustomer, fetchAllCustomers, selectCustomers } from "app/api/store/customerSlice"
import DeleteCustomerModal from "components/ui/Modal/delete-customer-modal"
import CustomerDetailsModal from "components/ui/Modal/customer-details-modal"
import { AnimatePresence, motion } from "framer-motion"
import ArrowIcon from "public/Icons/arrowIcon"

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

  const fetchCustomers = useCallback(
    async (signal?: AbortSignal) => {
      try {
        await dispatch(fetchAllCustomers(currentPage - 1, itemsPerPage, signal))
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          console.error("Failed to fetch customers:", error)
        }
      }
    },
    [dispatch, currentPage, itemsPerPage]
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchCustomers(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchCustomers])

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

  return (
    <>
      <AddCustomerModal isOpen={isAddCustomerOpen} onClose={toggleAddCustomer} />
      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        customer={selectedCustomer}
        onCustomerUpdated={() => {
          dispatch(fetchAllCustomers(currentPage - 1, itemsPerPage))
        }}
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

        {loading ? (
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
        ) : error ? (
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
                      className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("sn")}
                    >
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      SN <RxCaretSort />
                    </th>
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
                          <div className="flex items-center gap-2">
                            <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                            {index + 1}
                          </div>
                        </td>
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

                {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(index + 1)}
                    className={`rounded-full px-3 py-1 ${
                      currentPage === index + 1 ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </motion.button>
                ))}

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
    </>
  )
}

export default AllCustomers
