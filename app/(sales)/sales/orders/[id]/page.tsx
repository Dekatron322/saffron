"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  fetchSaleOrderByIdAction,
  selectCurrentSaleOrder,
  selectCurrentSaleOrderError,
  selectCurrentSaleOrderLoading,
  clearCurrentSaleOrder,
  generateUpiQrCodeAction,
  selectUpiQrCodeLoading,
  selectUpiQrCodeError,
  selectUpiQrCodeBase64,
  clearUpiQrCode,
} from "app/api/store/salesSlice"
import { fetchAllCustomers, selectCustomers } from "app/api/store/customerSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { NotificationProvider, notify } from "components/ui/Notification/Notification"
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiEdit,
  FiFileText,
  FiInfo,
  FiPackage,
  FiPrinter,
  FiSave,
  FiShoppingBag,
  FiShoppingCart,
  FiTag,
  FiUser,
  FiX,
  FiCreditCard,
  FiRefreshCw,
} from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import QrCode from "public/qrcode"

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

const SalesOrderDetails = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const saleOrder = useAppSelector(selectCurrentSaleOrder)
  const loading = useAppSelector(selectCurrentSaleOrderLoading)
  const error = useAppSelector(selectCurrentSaleOrderError)
  const { customers } = useAppSelector(selectCustomers)

  // UPI QR Code state
  const upiQrCodeLoading = useAppSelector(selectUpiQrCodeLoading)
  const upiQrCodeError = useAppSelector(selectUpiQrCodeError)
  const upiQrCodeBase64 = useAppSelector(selectUpiQrCodeBase64)

  const [isEditing, setIsEditing] = useState(false)
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [customerMap, setCustomerMap] = useState<Map<number, Customer>>(new Map())
  const [activeTab, setActiveTab] = useState("overview")
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "UPI" | "CARD">("CASH")
  const [paymentAmount, setPaymentAmount] = useState<number>(0)

  const id = useMemo(() => Number(params.id), [params.id])

  useEffect(() => {
    if (id) {
      dispatch(fetchSaleOrderByIdAction(id))
      dispatch(fetchAllCustomers(0, 1000))
    }

    return () => {
      dispatch(clearCurrentSaleOrder())
      dispatch(clearUpiQrCode())
    }
  }, [dispatch, id])

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

  // Update payment amount when sale order changes
  useEffect(() => {
    if (saleOrder) {
      const subtotal = calculateSubtotal()
      const tax = calculateTax()
      const grandTotal = calculateGrandTotal()
      const outstandingAmount = Math.max(grandTotal - (saleOrder.paidAmount || 0), 0)
      setPaymentAmount(outstandingAmount)
    }
  }, [saleOrder])

  // Get customer name by ID
  const getCustomerName = (customerId: number): string => {
    const customer = customerMap.get(customerId)
    return customer ? customer.customerName : `Customer ${customerId}`
  }

  // Get customer details
  const getCustomerDetails = (customerId: number): Customer | null => {
    return customerMap.get(customerId) || null
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

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Failed":
      case "Overdue":
        return "bg-rose-50 text-rose-700 border-rose-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }, [])

  const getStatusDot = useCallback((status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return "bg-emerald-500"
      case "Pending":
        return "bg-amber-500"
      case "Failed":
      case "Overdue":
        return "bg-rose-500"
      default:
        return "bg-slate-500"
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }, [])

  const calculateItemTotal = (item: any) => {
    return item.pricePerUnit * item.quantity
  }

  const calculateSubtotal = () => {
    if (!saleOrder) return 0
    return saleOrder.saleOrderItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const calculateTax = () => {
    if (!saleOrder) return 0
    return saleOrder.saleOrderItems.reduce((total, item) => {
      const itemTotal = calculateItemTotal(item)
      return total + itemTotal * (item.tax / 100)
    }, 0)
  }

  const calculateGrandTotal = () => {
    if (!saleOrder) return 0
    const subtotal = calculateSubtotal()
    const tax = calculateTax()

    // Apply discounts if any
    let discountAmount = 0
    if (saleOrder.loyaltyPointDiscount) {
      discountAmount += saleOrder.loyaltyPointDiscount
    }
    if (saleOrder.subscriptionDiscount) {
      discountAmount += saleOrder.subscriptionDiscount
    }

    return subtotal + tax - discountAmount
  }

  const toggleItemExpansion = useCallback((itemId: number) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownload = useCallback(() => {
    notify("info", "Download functionality", {
      description: "PDF download would be implemented here",
    })
  }, [])

  const handleSave = useCallback(async () => {
    notify("success", "Changes saved successfully")
    setIsEditing(false)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    notify("info", "Edit cancelled", {
      description: "Changes were not saved",
    })
  }, [])

  const handleOpenPaymentDrawer = useCallback(() => {
    setIsPaymentDrawerOpen(true)
    // Clear any existing QR code when opening drawer
    dispatch(clearUpiQrCode())
  }, [dispatch])

  const handleClosePaymentDrawer = useCallback(() => {
    setIsPaymentDrawerOpen(false)
    setSelectedPaymentMethod("CASH")
    dispatch(clearUpiQrCode())
  }, [dispatch])

  const handleGenerateUpiQrCode = useCallback(async () => {
    if (!saleOrder || !paymentAmount || paymentAmount <= 0) {
      notify("error", "Invalid payment amount", {
        description: "Please enter a valid payment amount",
      })
      return
    }

    try {
      const customer = getCustomerDetails(saleOrder.customerId)
      if (!customer) {
        notify("error", "Customer not found", {
          description: "Unable to generate QR code without customer details",
        })
        return
      }

      const qrCodeData = {
        name: customer.customerName,
        email: customer.customerEmail,
        phoneNumber: customer.customerPhone,
        amount: paymentAmount,
      }

      await dispatch(generateUpiQrCodeAction(qrCodeData))

      notify("success", "QR Code Generated", {
        description: "Scan the QR code to complete UPI payment",
      })
    } catch (error: any) {
      console.error("Failed to generate QR code:", error)
      notify("error", "Failed to generate QR code", {
        description: error.message || "Please try again",
      })
    }
  }, [dispatch, saleOrder, paymentAmount])

  const handleConfirmPayment = useCallback(() => {
    if (selectedPaymentMethod === "UPI" && !upiQrCodeBase64) {
      notify("warning", "Generate QR Code First", {
        description: "Please generate the UPI QR code before confirming payment",
      })
      return
    }

    notify("success", "Payment recorded", {
      description: `Payment via ${selectedPaymentMethod.replace("_", " ")}`,
    })
    setIsPaymentDrawerOpen(false)
    dispatch(clearUpiQrCode())
  }, [selectedPaymentMethod, upiQrCodeBase64, dispatch])

  const handlePaymentMethodChange = useCallback(
    (method: "CASH" | "BANK_TRANSFER" | "UPI" | "CARD") => {
      setSelectedPaymentMethod(method)
      // Clear QR code when switching away from UPI
      if (method !== "UPI") {
        dispatch(clearUpiQrCode())
      }
    },
    [dispatch]
  )

  const handlePaymentAmountChange = useCallback((amount: number) => {
    if (amount >= 0) {
      setPaymentAmount(amount)
    }
  }, [])

  // Calculate amounts
  const subtotal = saleOrder ? calculateSubtotal() : 0
  const tax = saleOrder ? calculateTax() : 0
  const grandTotal = saleOrder ? calculateGrandTotal() : 0
  const outstandingAmount = saleOrder ? Math.max(grandTotal - (saleOrder.paidAmount || 0), 0) : 0
  const customer = saleOrder ? getCustomerDetails(saleOrder.customerId) : null

  // Skeleton Loading Components
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="mx-auto max-w-full">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="mb-4 h-8 w-64 rounded-lg bg-slate-200"></div>
          <div className="h-4 w-96 rounded bg-slate-200"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-slate-200"></div>
                <div className="flex-1">
                  <div className="mb-2 h-4 w-20 rounded bg-slate-200"></div>
                  <div className="h-6 w-24 rounded bg-slate-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-32 rounded bg-slate-200"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                    <div className="h-4 w-32 rounded bg-slate-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-32 rounded bg-slate-200"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                    <div className="h-4 w-32 rounded bg-slate-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <>
        <DashboardNav />
        <NotificationProvider />
        <SkeletonLoader />
      </>
    )
  }

  if (error) {
    return (
      <>
        <DashboardNav />
        <NotificationProvider />
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
          <div className="w-full max-w-full text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-100">
              <svg className="h-10 w-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Error Loading Order</h2>
            <p className="mb-6 text-slate-600">{error}</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonModule
                onClick={() => router.push("/orders")}
                variant="outline"
                icon={<FiArrowLeft />}
                iconPosition="start"
              >
                Back to Orders
              </ButtonModule>
              <ButtonModule onClick={() => dispatch(fetchSaleOrderByIdAction(id))} variant="primary">
                Try Again
              </ButtonModule>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!saleOrder) {
    return (
      <>
        <DashboardNav />
        <NotificationProvider />
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
          <div className="w-full max-w-full text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
              <FiShoppingCart className="h-10 w-10 text-slate-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Order Not Found</h2>
            <p className="mb-6 text-slate-600">The requested sales order could not be found.</p>
            <ButtonModule
              onClick={() => router.push("/orders")}
              variant="outline"
              icon={<FiArrowLeft />}
              iconPosition="start"
            >
              Back to Orders
            </ButtonModule>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardNav />
      <NotificationProvider />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-full px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Order Details</h1>
                  <p className="mt-1 flex items-center space-x-2 text-slate-600">
                    <FiFileText className="size-4" />
                    <span>Invoice #{saleOrder.saleOrderInvoiceNo}</span>
                    <span className="text-slate-400">•</span>
                    <span>{formatDate(saleOrder.createdDate)}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <ButtonModule
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  icon={<FiPrinter />}
                  className="rounded-xl border-slate-300"
                >
                  Print
                </ButtonModule>
                <ButtonModule
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  icon={<FiDownload />}
                  className="rounded-xl border-slate-300"
                >
                  Download
                </ButtonModule>
                {!isEditing ? (
                  <ButtonModule
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    size="sm"
                    icon={<FiEdit />}
                    className="rounded-xl"
                  >
                    Edit Order
                  </ButtonModule>
                ) : (
                  <div className="flex gap-2">
                    <ButtonModule
                      onClick={handleSave}
                      variant="primary"
                      size="sm"
                      icon={<FiSave />}
                      className="rounded-xl"
                    >
                      Save Changes
                    </ButtonModule>
                    <ButtonModule
                      onClick={handleCancelEdit}
                      variant="danger"
                      size="sm"
                      icon={<FiX />}
                      className="rounded-xl"
                    >
                      Cancel
                    </ButtonModule>
                  </div>
                )}
                <ButtonModule
                  onClick={handleOpenPaymentDrawer}
                  variant="primary"
                  size="sm"
                  icon={<FiCreditCard />}
                  className="rounded-xl"
                >
                  Make Payment
                </ButtonModule>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-full p-6">
          {/* Status Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <FiDollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Amount</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(grandTotal)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <FiCheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Order Status</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className={`size-2 rounded-full ${getStatusDot(saleOrder.orderStatus)}`}></div>
                    <span className="text-lg font-semibold text-slate-900">{saleOrder.orderStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <FiPackage className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Items</p>
                  <p className="text-2xl font-bold text-slate-900">{saleOrder.saleOrderItems.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <FiClock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Payment Status</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <div
                      className={`size-2 rounded-full ${getStatusDot(getPaymentStatusText(saleOrder.paymentStatusId))}`}
                    ></div>
                    <span className="text-lg font-semibold text-slate-900">
                      {getPaymentStatusText(saleOrder.paymentStatusId)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Order Items */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <FiShoppingBag className="mr-2 h-5 w-5 text-blue-600" />
                    Order Items
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {saleOrder.saleOrderItems.map((item, index) => {
                      const itemTotal = calculateItemTotal(item)
                      const itemTax = itemTotal * (item.tax / 100)
                      const itemTotalWithTax = itemTotal + itemTax

                      return (
                        <div
                          key={item.saleOrderItemId}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex flex-1 items-start space-x-4">
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                                <FiPackage className="h-5 w-5 text-slate-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-slate-900">{item.itemName}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                                <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500">
                                  <span>Batch: {item.batchNo}</span>
                                  <span>HSN: {item.hsnCode}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="font-semibold text-slate-900">{formatCurrency(itemTotalWithTax)}</p>
                              <p className="text-sm text-slate-600">
                                {item.quantity} × {formatCurrency(item.pricePerUnit)}
                              </p>
                            </div>
                          </div>

                          {/* Expandable Details */}
                          <div className="mt-4 border-t border-slate-200 pt-4">
                            <button
                              onClick={() => toggleItemExpansion(item.saleOrderItemId)}
                              className="flex items-center space-x-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
                            >
                              <span>View details</span>
                              {expandedItems.includes(item.saleOrderItemId) ? (
                                <FiChevronUp className="size-4" />
                              ) : (
                                <FiChevronDown className="size-4" />
                              )}
                            </button>

                            {expandedItems.includes(item.saleOrderItemId) && (
                              <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-center space-x-2">
                                  <FiTag className="size-4 text-slate-400" />
                                  <span className="text-slate-600">Manufacturer:</span>
                                  <span className="font-medium text-slate-900">{item.mfg}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FiCalendar className="size-4 text-slate-400" />
                                  <span className="text-slate-600">Expiry:</span>
                                  <span className="font-medium text-slate-900">{formatDate(item.expDate)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FiDollarSign className="size-4 text-slate-400" />
                                  <span className="text-slate-600">MRP:</span>
                                  <span className="font-medium text-slate-900">{formatCurrency(item.mrp)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FiPackage className="size-4 text-slate-400" />
                                  <span className="text-slate-600">Packing:</span>
                                  <span className="font-medium text-slate-900">{item.packing}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FiTag className="size-4 text-slate-400" />
                                  <span className="text-slate-600">Unit:</span>
                                  <span className="font-medium text-slate-900">{item.unitName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FiInfo className="size-4 text-slate-400" />
                                  <span className="text-slate-600">Tax:</span>
                                  <span className="font-medium text-slate-900">{item.tax}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <FiDollarSign className="mr-2 h-5 w-5 text-emerald-600" />
                    Payment Summary
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-600">Tax Amount</span>
                      <span className="font-medium text-slate-900">{formatCurrency(tax)}</span>
                    </div>
                    {saleOrder.loyaltyPointDiscount && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-600">Loyalty Discount</span>
                        <span className="font-medium text-emerald-600">
                          -{formatCurrency(saleOrder.loyaltyPointDiscount)}
                        </span>
                      </div>
                    )}
                    {saleOrder.subscriptionDiscount && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-600">Subscription Discount</span>
                        <span className="font-medium text-emerald-600">
                          -{formatCurrency(saleOrder.subscriptionDiscount)}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-900">Grand Total</span>
                        <span className="text-lg font-bold text-slate-900">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Order Information */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <FiFileText className="mr-2 h-5 w-5 text-blue-600" />
                    Order Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Order ID</label>
                      <p className="font-semibold text-slate-900">#{saleOrder.saleOrderId}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Invoice Number</label>
                      <p className="font-semibold text-slate-900">{saleOrder.saleOrderInvoiceNo}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Order Date</label>
                      <p className="text-slate-900">{formatDate(saleOrder.createdDate)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Order Status</label>
                      <div
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(
                          saleOrder.orderStatus
                        )}`}
                      >
                        {saleOrder.orderStatus}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Return Status</label>
                      <p className="text-slate-900">{saleOrder.returnStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <FiUser className="mr-2 h-5 w-5 text-purple-600" />
                    Customer Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Customer Name</label>
                      <p className="font-semibold text-slate-900">{getCustomerName(saleOrder.customerId)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Customer ID</label>
                      <p className="text-slate-900">#{saleOrder.customerId}</p>
                    </div>
                    {customer && (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-600">Email</label>
                          <p className="text-slate-900">{customer.customerEmail}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-600">Phone</label>
                          <p className="text-slate-900">{customer.customerPhone}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-600">Loyalty Points</label>
                          <p className="text-slate-900">{customer.customerLoyaltyPoints.toLocaleString()}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <FiDollarSign className="mr-2 h-5 w-5 text-emerald-600" />
                    Payment Details
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Payment Status</label>
                      <div
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(
                          getPaymentStatusText(saleOrder.paymentStatusId)
                        )}`}
                      >
                        {getPaymentStatusText(saleOrder.paymentStatusId)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Payment Type</label>
                      <p className="text-slate-900">{getPaymentTypeText(saleOrder.paymentTypeId)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Paid Amount</label>
                      <p className="font-semibold text-slate-900">{formatCurrency(saleOrder.paidAmount)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Outstanding Amount</label>
                      <p className="font-semibold text-amber-700">{formatCurrency(outstandingAmount)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-600">Link Payment</label>
                      <p className="text-slate-900">{saleOrder.linkPayment ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Drawer */}
        {isPaymentDrawerOpen && (
          <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-sm">
            <div className="size-full max-w-md bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <FiCreditCard className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Make Payment</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClosePaymentDrawer}
                  className="inline-flex items-center justify-center rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <div className="flex h-[calc(100%-4rem)] flex-col justify-between">
                <div className="space-y-6 overflow-y-auto px-6 py-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">Payment Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                      </div>

                      {/* Tax Amount */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tax Amount</span>
                        <span className="font-medium text-slate-900">{formatCurrency(tax)}</span>
                      </div>

                      {/* Discounts if any */}
                      {(saleOrder.loyaltyPointDiscount ?? 0) > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Loyalty Discount(s)</span>
                          <span className="font-medium text-emerald-600">
                            -{formatCurrency(saleOrder.loyaltyPointDiscount ?? 0)}
                          </span>
                        </div>
                      )}

                      {(saleOrder.subscriptionDiscount ?? 0) > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Subscription Discount</span>
                          <span className="font-medium text-emerald-600">
                            -{formatCurrency(saleOrder.subscriptionDiscount ?? 0)}
                          </span>
                        </div>
                      )}

                      {/* Grand Total */}
                      <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                        <span className="text-sm font-semibold text-slate-900">Grand Total</span>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(grandTotal)}</span>
                      </div>

                      {/* Already Paid */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Already Paid</span>
                        <span className="font-medium text-emerald-700">{formatCurrency(saleOrder.paidAmount)}</span>
                      </div>

                      {/* Outstanding Amount */}
                      <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                        <span className="text-sm font-semibold text-slate-900">Outstanding Amount</span>
                        <span className="text-base font-bold text-amber-700">{formatCurrency(outstandingAmount)}</span>
                      </div>

                      {/* Optional: Item Quantity Summary */}
                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Total Items</span>
                          <span>{saleOrder.saleOrderItems.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Total Quantity</span>
                          <span>{saleOrder.saleOrderItems.reduce((total, item) => total + item.quantity, 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Amount Input */}
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value <= outstandingAmount) {
                        handlePaymentAmountChange(value)
                      } else {
                        // Auto-correct to max value if user types beyond outstanding amount
                        handlePaymentAmountChange(outstandingAmount)
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure value is within bounds when user leaves the field
                      const value = Number(e.target.value)
                      if (value > outstandingAmount) {
                        handlePaymentAmountChange(outstandingAmount)
                      } else if (value < 0) {
                        handlePaymentAmountChange(0)
                      }
                    }}
                    className="block w-full rounded-xl border border-slate-200  bg-white py-3 pl-7 pr-12 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter payment amount"
                    min="0"
                    max={outstandingAmount}
                    step="0.01"
                  />

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange("CASH")}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          selectedPaymentMethod === "CASH"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60"
                        }`}
                      >
                        <span>Cash</span>
                        {selectedPaymentMethod === "CASH" && (
                          <span className="text-xs font-medium uppercase text-emerald-700">Selected</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange("BANK_TRANSFER")}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          selectedPaymentMethod === "BANK_TRANSFER"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60"
                        }`}
                      >
                        <span>Bank Transfer</span>
                        {selectedPaymentMethod === "BANK_TRANSFER" && (
                          <span className="text-xs font-medium uppercase text-emerald-700">Selected</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange("UPI")}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          selectedPaymentMethod === "UPI"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60"
                        }`}
                      >
                        <span>UPI</span>
                        {selectedPaymentMethod === "UPI" && (
                          <span className="text-xs font-medium uppercase text-emerald-700">Selected</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange("CARD")}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          selectedPaymentMethod === "CARD"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60"
                        }`}
                      >
                        <span>Debit / Credit Card</span>
                        {selectedPaymentMethod === "CARD" && (
                          <span className="text-xs font-medium uppercase text-emerald-700">Selected</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UPI QR Code Section */}
                  {selectedPaymentMethod === "UPI" && (
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">UPI QR Code</h3>
                        {upiQrCodeBase64 && (
                          <ButtonModule
                            onClick={handleGenerateUpiQrCode}
                            variant="outline"
                            size="sm"
                            icon={<FiRefreshCw />}
                            className="text-xs"
                          >
                            Regenerate
                          </ButtonModule>
                        )}
                      </div>

                      {upiQrCodeLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-3 py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                          <p className="text-sm text-slate-600">Generating QR Code...</p>
                        </div>
                      ) : upiQrCodeError ? (
                        <div className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                          <div className="rounded-full bg-rose-100 p-3">
                            <FiX className="h-6 w-6 text-rose-600" />
                          </div>
                          <p className="text-sm font-medium text-rose-700">Failed to generate QR code</p>
                          <p className="text-xs text-slate-600">{upiQrCodeError}</p>
                          <ButtonModule
                            onClick={handleGenerateUpiQrCode}
                            variant="primary"
                            size="sm"
                            icon={<FiRefreshCw />}
                          >
                            Try Again
                          </ButtonModule>
                        </div>
                      ) : upiQrCodeBase64 ? (
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
                            <img
                              src={`data:image/png;base64,${upiQrCodeBase64}`}
                              alt="UPI QR Code"
                              className="h-72 w-72 object-contain"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-slate-900">Scan to Pay</p>
                            <p className="text-xs text-slate-600">Amount: {formatCurrency(paymentAmount)}</p>
                          </div>
                          <div className="text-center text-xs text-slate-500">
                            <p>Customer: {customer?.customerName}</p>
                            <p>Phone: {customer?.customerPhone}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                          <div className="rounded-full bg-slate-100 p-3"></div>
                          <p className="text-sm font-medium text-slate-700">Generate UPI QR Code</p>
                          <p className="text-xs text-slate-600">Click the button below to create a payment QR code</p>
                          <ButtonModule
                            onClick={handleGenerateUpiQrCode}
                            variant="primary"
                            size="sm"
                            disabled={!paymentAmount || paymentAmount <= 0}
                          >
                            Generate QR Code
                          </ButtonModule>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <ButtonModule onClick={handleClosePaymentDrawer} variant="outline" size="sm" className="flex-1">
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      onClick={handleConfirmPayment}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      disabled={
                        !paymentAmount || paymentAmount <= 0 || (selectedPaymentMethod === "UPI" && !upiQrCodeBase64)
                      }
                    >
                      {selectedPaymentMethod === "UPI"
                        ? "Confirm UPI Payment"
                        : `Confirm ${selectedPaymentMethod.replace("_", " ")} Payment`}
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default SalesOrderDetails
