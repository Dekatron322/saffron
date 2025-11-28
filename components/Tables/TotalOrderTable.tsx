"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "app/api/store/store"
import {
  fetchSaleOrders,
  selectSales,
  selectSalesError,
  selectSalesLoading,
  selectSalesPagination,
} from "app/api/store/salesSlice"
import { fetchAllCustomers, selectCustomers } from "app/api/store/customerSlice"

interface SaleOrder {
  saleOrderId: number
  customerId: number
  paymentStatusId: number
  paymentTypeId: number
  orderStatus: string
  returnStatus: string
  saleOrderItems: Array<{
    saleOrderItemId: number
    itemName: string
    hsnCode: string
    description: string
    batchNo: string
    mfg: string
    expDate: string
    mfgDate: string
    mrp: number
    packing: string
    quantity: number
    pricePerUnit: number
    tax: number
    unitName: string
    unitSold: number
    createdDate: string
    discountType?: string | null
    discountValue?: number
  }>
  paidAmount: number
  linkPayment: boolean
  deductibleWalletAmount: number | null
  placeOfSupply: number
  promoCode: string | null
  saleOrderInvoiceNo: string
  createdDate: string
  loyaltyPointUsed: boolean
  loyaltyPoints: number | null
  subscriptionPoints: number | null
  checkoutType: string | null
  paymentInfo: any | null
  upgradeSubscription: any | null
  purchaseSubscription: any | null
  subscriptionDetails: any | null
  extraDiscount: boolean
  saleType: string | null
  loyaltyPointDiscount: number | null
  subscriptionDiscount: number | null
}

interface Customer {
  customerProfileId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerLoyaltyPoints: number
  customerPassword: string
  gstin: string | null
  subscriptionValidation: any | null
  subscriptionOpt: any | null
  subscriptionDuration: any | null
  status?: string
  subscriptionAmt?: number | null
  gstAmt?: number | null
  totalAmt?: number | null
}

type SortOrder = "asc" | "desc" | null

const TotalOrderTable = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const sales = useSelector(selectSales)
  const loading = useSelector(selectSalesLoading)
  const error = useSelector(selectSalesError)
  const pagination = useSelector(selectSalesPagination)
  const { customers } = useSelector(selectCustomers)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [customerMap, setCustomerMap] = useState<Map<number, Customer>>(new Map())

  useEffect(() => {
    // Fetch sales orders when component mounts
    const fetchData = async () => {
      try {
        await dispatch(
          fetchSaleOrders({
            pageNo: 0,
            pageSize: 100,
            sortBy: "saleOrderId",
            sortDir: "asc",
          })
        ).unwrap()
      } catch (error) {
        console.error("Failed to fetch sales orders:", error)
      }
    }

    fetchData()
  }, [dispatch])

  useEffect(() => {
    // Fetch customers when component mounts
    const fetchCustomers = async () => {
      try {
        await dispatch(fetchAllCustomers(0, 1000))
      } catch (error) {
        console.error("Failed to fetch customers:", error)
      }
    }

    fetchCustomers()
  }, [dispatch])

  // Create customer map for quick lookup
  useEffect(() => {
    if (customers && customers.length > 0) {
      const map = new Map<number, Customer>()
      customers.forEach((customer) => {
        map.set(customer.customerProfileId, customer)
      })
      setCustomerMap(map)
    }
  }, [customers])

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

  // Get customer name by ID
  const getCustomerName = (customerId: number): string => {
    const customer = customerMap.get(customerId)
    return customer ? customer.customerName : `Customer ${customerId}`
  }

  // Get payment status text based on paymentStatusId
  const getPaymentStatusText = (paymentStatusId: number): string => {
    switch (paymentStatusId) {
      case 1:
        return "Paid"
      case 2:
        return "Partially Paid"
      default:
        return "Unknown"
    }
  }

  // Get payment type text based on paymentTypeId
  const getPaymentTypeText = (paymentTypeId: number): string => {
    switch (paymentTypeId) {
      case 1:
        return "CASH"
      default:
        return "Unknown"
    }
  }

  const getPaymentStyle = (status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Partially Paid":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Not Paid":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "Overdue":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "Pending":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      default:
        return {}
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return { backgroundColor: "#589E67" }
      case "Partially Paid":
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

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Format items purchased string
  const formatItemsPurchased = (saleOrder: SaleOrder) => {
    return saleOrder.saleOrderItems.map((item) => `${item.itemName} (${item.quantity}x)`).join(", ")
  }

  // Calculate total amount
  const calculateTotalAmount = (saleOrder: SaleOrder) => {
    return saleOrder.saleOrderItems.reduce((total, item) => {
      return total + item.pricePerUnit * item.quantity
    }, 0)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Filter orders based on search text
  const filteredOrders = sales.filter((order) => {
    const customerName = getCustomerName(order.customerId).toLowerCase()

    return (
      order.saleOrderInvoiceNo.toLowerCase().includes(searchText.toLowerCase()) ||
      customerName.includes(searchText.toLowerCase()) ||
      order.orderStatus.toLowerCase().includes(searchText.toLowerCase()) ||
      getPaymentStatusText(order.paymentStatusId).toLowerCase().includes(searchText.toLowerCase()) ||
      formatItemsPurchased(order).toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerId.toString().includes(searchText)
    )
  })

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

  if (loading) {
    return (
      <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
        <div className="flex h-60 items-center justify-center">
          <p className="text-lg">Loading orders...</p>
        </div>
      </div>
    )
  }

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
              onClick={() => alert("Export functionality")}
            >
              <p className="max-sm:hidden">Export</p>
            </ButtonModule>
          </div>
        </div>

        {error ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <div className="text-center">
              <EmptyState />
              <p className="text-xl font-bold text-[#D82E2E]">Failed to load orders.</p>
              <p>Please refresh or try again later.</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <EmptyState />
            <p className="text-base font-bold text-[#202B3C]">No orders found.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto border-l border-r">
              <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="flex items-center gap-2 whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      SN
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Order ID <RxCaretSort />
                      </div>
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Customer Name <RxCaretSort />
                      </div>
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Items Purchased <RxCaretSort />
                      </div>
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Total Amount <RxCaretSort />
                      </div>
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Order Status <RxCaretSort />
                      </div>
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Date <RxCaretSort />
                      </div>
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Payment Status <RxCaretSort />
                      </div>
                    </th>
                    <th className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        Payment Type <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, index) => (
                    <tr key={order.saleOrderId}>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                          {indexOfFirstOrder + index + 1}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">#{order.saleOrderInvoiceNo}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">{getCustomerName(order.customerId)}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">{formatItemsPurchased(order)}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex">
                          <div
                            style={getPaymentStyle(getPaymentStatusText(order.paymentStatusId))}
                            className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          >
                            <span className="text-grey-400">₹</span>
                            {calculateTotalAmount(order).toLocaleString()}
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
                        <div className="flex items-center gap-2">{formatDate(order.createdDate)}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex">
                          <div
                            style={getPaymentStyle(getPaymentStatusText(order.paymentStatusId))}
                            className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          >
                            <span
                              className="size-2 rounded-full"
                              style={dotStyle(getPaymentStatusText(order.paymentStatusId))}
                            ></span>
                            {getPaymentStatusText(order.paymentStatusId)}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex">
                          <div
                            style={getPaymentStyle(getPaymentTypeText(order.paymentTypeId))}
                            className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          >
                            <span
                              className="size-2 rounded-full"
                              style={dotStyle(getPaymentTypeText(order.paymentTypeId))}
                            ></span>
                            {getPaymentTypeText(order.paymentTypeId)}
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
                                  router.push(`/sales/orders/${order.saleOrderId}`)
                                  closeDropdown()
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  alert(`Editing order: ${order.saleOrderInvoiceNo}`)
                                  closeDropdown()
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit Order
                              </button>
                              <button
                                onClick={() => {
                                  alert(`Deleting order: ${order.saleOrderInvoiceNo}`)
                                  closeDropdown()
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
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

export default TotalOrderTable
