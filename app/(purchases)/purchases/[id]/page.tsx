"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  calculateOrderTotals,
  clearCurrentPurchaseOrder,
  fetchPurchaseOrderById,
  fetchPurchaseReturnReasons,
  selectCurrentPurchaseOrder,
  selectCurrentPurchaseOrderError,
  selectCurrentPurchaseOrderLoading,
  selectPurchaseReturnReasons,
  selectPurchaseReturnReasonsLoading,
  selectUpdatePaymentStatusError,
  selectUpdatingPaymentStatus,
  updatePaymentStatus,
} from "app/api/store/purchaseSlice"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { NotificationProvider, notify } from "components/ui/Notification/Notification"

import {
  FiArrowLeft,
  FiAward,
  FiBox,
  FiCalendar as FiCalendarIcon,
  FiCheckCircle,
  FiClock,
  FiCodesandbox,
  FiDollarSign,
  FiDownload,
  FiEdit,
  FiInfo,
  FiLayers,
  FiMapPin,
  FiPercent,
  FiPieChart,
  FiPrinter,
  FiSave,
  FiSend,
  FiShoppingBag,
  FiTag,
  FiX,
} from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"

interface ItemEditState {
  purchaseOrderItemId: number
  statusOfItem: string
  defectQuantity: number
  discountType: string
  discountValue: number
}

const PurchaseOrderDetails = () => {
  const params = useParams()
  const dispatch = useAppDispatch()
  const purchaseOrder = useAppSelector(selectCurrentPurchaseOrder)
  const loading = useAppSelector(selectCurrentPurchaseOrderLoading)
  const error = useAppSelector(selectCurrentPurchaseOrderError)
  const updatingPaymentStatus = useAppSelector(selectUpdatingPaymentStatus)
  const updatePaymentStatusError = useAppSelector(selectUpdatePaymentStatusError)
  const returnReasons = useAppSelector(selectPurchaseReturnReasons)
  const returnReasonsLoading = useAppSelector(selectPurchaseReturnReasonsLoading)
  const { suppliers } = useAppSelector(selectSuppliers)

  // Memoize derived values
  const isOrderApproved = useMemo(() => purchaseOrder?.orderStatus === "APPROVED", [purchaseOrder?.orderStatus])
  const id = useMemo(() => Number(params.id), [params.id])

  const [isEditing, setIsEditing] = useState(false)
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [formData, setFormData] = useState({
    paymentStatus: "",
    paymentCategory: "",
    paidAmount: 0,
    linkPayment: false,
    deductibleWalletAmount: 0,
    orderStatus: "",
    discount: 0,
    discountType: "AMOUNT",
  })

  // State for editing items
  const [editingItems, setEditingItems] = useState<ItemEditState[]>([])

  useEffect(() => {
    if (id) {
      dispatch(fetchPurchaseOrderById(id))
      dispatch(fetchPurchaseReturnReasons())
      dispatch(fetchAllSuppliers())
    }

    return () => {
      dispatch(clearCurrentPurchaseOrder())
    }
  }, [dispatch, id])

  // Update form data only when purchaseOrder changes meaningfully
  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        paymentStatus: purchaseOrder.paymentStatus || "",
        paymentCategory: purchaseOrder.paymentCategory || "",
        paidAmount: purchaseOrder.paidAmount || 0,
        linkPayment: purchaseOrder.linkPayment || false,
        deductibleWalletAmount: purchaseOrder.deductibleWalletAmount || 0,
        orderStatus: purchaseOrder.orderStatus || "",
        discount: purchaseOrder.discount || 0,
        discountType: purchaseOrder.discountDto?.discountType === "Percentage" ? "PERCENTAGE" : "AMOUNT",
      })

      // Initialize editing items with current values
      setEditingItems(
        purchaseOrder.purchaseOrderItems.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          statusOfItem: item.statusOfItem || "ACTIVE",
          defectQuantity: item.defectQuantity || 0,
          discountType: item.discountType || item.itemDetails?.discountType || "Percentage",
          discountValue: item.discountValue || item.itemDetails?.saleDiscount || 0,
        }))
      )
    }
  }, [purchaseOrder])

  // Fixed calculation logic - order discount should be calculated from final amount with tax
  const calculateOrderTotals = useCallback((): {
    subtotal: number
    totalItemDiscount: number
    orderDiscount: number
    totalDiscount: number
    totalTax: number
    totalAmount: number
    totalAmountWithTax: number
    totalAmountWithTaxBeforeOrderDiscount: number
    orderDiscountedAmount: number
    netAmountBeforeTax: number
  } => {
    if (!purchaseOrder)
      return {
        subtotal: 0,
        totalItemDiscount: 0,
        orderDiscount: 0,
        totalDiscount: 0,
        totalTax: 0,
        totalAmount: 0,
        totalAmountWithTax: 0,
        totalAmountWithTaxBeforeOrderDiscount: 0,
        orderDiscountedAmount: 0,
        netAmountBeforeTax: 0,
      }

    let subtotal = 0
    let totalItemDiscount = 0
    let totalTax = 0

    // Calculate item-level totals
    purchaseOrder.purchaseOrderItems.forEach((item) => {
      const editedItem = editingItems.find((editItem) => editItem.purchaseOrderItemId === item.purchaseOrderItemId) || {
        purchaseOrderItemId: item.purchaseOrderItemId,
        discountType: item.discountType || "Percentage",
        discountValue: item.discountValue || 0,
      }

      const quantity = item.quantity || 1
      const unitPrice = item.unitPrice || 0
      const taxRate = item.itemDetails?.taxRate || 0

      // Calculate item subtotal
      const itemSubtotal = quantity * unitPrice
      subtotal += itemSubtotal

      // Calculate item-level discount
      let itemDiscount = 0
      if (editedItem.discountType === "Percentage") {
        itemDiscount = itemSubtotal * (editedItem.discountValue / 100)
      } else {
        itemDiscount = editedItem.discountValue
      }
      totalItemDiscount += itemDiscount

      // Calculate tax on discounted amount (after item discounts only)
      const discountedAmount = Math.max(0, itemSubtotal - itemDiscount)
      const itemTax = discountedAmount * (taxRate / 100)
      totalTax += itemTax
    })

    // Calculate amount after item discounts and tax (this is the final amount before order discount)
    const amountAfterItemDiscounts = Math.max(0, subtotal - totalItemDiscount)
    const totalAmountWithTaxBeforeOrderDiscount = amountAfterItemDiscounts + totalTax

    // Calculate order-level discount (this should be calculated from the final amount with tax)
    let orderDiscount = 0
    let orderDiscountedAmount = 0

    if (formData.discount > 0) {
      if (formData.discountType === "PERCENTAGE") {
        // Apply order discount to the final amount with tax (₹61.49)
        orderDiscount = totalAmountWithTaxBeforeOrderDiscount * (formData.discount / 100)
        orderDiscountedAmount = orderDiscount
      } else {
        orderDiscount = formData.discount
        orderDiscountedAmount = orderDiscount
      }
    }

    const totalDiscount = totalItemDiscount + orderDiscount

    // Calculate final amount after ALL discounts
    const finalTotalWithTax = Math.max(0, totalAmountWithTaxBeforeOrderDiscount - orderDiscount)

    return {
      subtotal, // Original subtotal without any discounts
      totalItemDiscount, // Only item-level discounts
      orderDiscount, // Only order-level discount
      totalDiscount, // Total of all discounts
      totalTax,
      totalAmount: subtotal, // This should be the subtotal (no discounts applied)
      totalAmountWithTax: finalTotalWithTax, // Final amount after ALL discounts and tax
      totalAmountWithTaxBeforeOrderDiscount, // Amount after item discounts and tax, before order discount
      orderDiscountedAmount,
      netAmountBeforeTax: amountAfterItemDiscounts, // Amount after item discounts but before tax
    }
  }, [purchaseOrder, editingItems, formData.discount, formData.discountType])

  const toggleItemExpansion = useCallback((itemId: number) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const calculateDiscountedTotal = useCallback(() => {
    const { netAmountBeforeTax } = calculateOrderTotals()
    return netAmountBeforeTax
  }, [calculateOrderTotals])

  const calculateDiscountedTotalWithTax = useCallback(() => {
    const { totalAmountWithTax } = calculateOrderTotals()
    return totalAmountWithTax
  }, [calculateOrderTotals])

  const supplierName = useMemo(() => {
    if (!purchaseOrder) return "-"
    const supplier = suppliers.find((s) => s.id === purchaseOrder.supplierId)
    return supplier ? supplier.name : `Supplier #${purchaseOrder.supplierId}`
  }, [purchaseOrder, suppliers])

  const calculateItemDiscountedPrice = useCallback((item: any, editedItem: ItemEditState) => {
    const quantity = item.quantity || 1
    const unitPrice = item.unitPrice || 0
    const taxRate = item.itemDetails?.taxRate || 0
    const subtotal = quantity * unitPrice

    // Calculate item-level discount
    let itemDiscount = 0
    if (editedItem.discountType === "Percentage") {
      itemDiscount = subtotal * (editedItem.discountValue / 100)
    } else {
      itemDiscount = editedItem.discountValue
    }

    const discountedAmount = Math.max(0, subtotal - itemDiscount)
    const taxAmount = discountedAmount * (taxRate / 100)

    return discountedAmount + taxAmount
  }, [])

  const handleSaveAll = useCallback(async () => {
    if (!purchaseOrder) return

    try {
      // Calculate proper totals using the helper functions
      const {
        subtotal,
        totalItemDiscount,
        orderDiscount,
        totalTax,
        totalAmount,
        totalAmountWithTax,
        orderDiscountedAmount,
        netAmountBeforeTax,
        totalAmountWithTaxBeforeOrderDiscount,
      } = calculateOrderTotals()

      const updateData = {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        supplierId: purchaseOrder.supplierId,
        orderDate: purchaseOrder.orderDate,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        totalAmount: totalAmount, // This should be the subtotal (₹59.70)
        totalAmountWithTax: totalAmountWithTax,
        raised: purchaseOrder.raised,
        purchaseOrderItems: purchaseOrder.purchaseOrderItems.map((item) => {
          const editedItem = editingItems.find((editItem) => editItem.purchaseOrderItemId === item.purchaseOrderItemId)
          return {
            itemDetails: {
              ...item.itemDetails,
              discountType: editedItem?.discountType || item.itemDetails?.discountType || "Percentage",
              saleDiscount: editedItem?.discountValue || item.itemDetails?.saleDiscount || 0,
            },
            purchaseOrderItemId: item.purchaseOrderItemId,
            productId: item.productId || 0,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            statusOfItem: editedItem?.statusOfItem || item.statusOfItem || "ACTIVE",
            defectQuantity: editedItem?.defectQuantity || item.defectQuantity || 0,
            // Add discount fields at item level for API
            discountType: editedItem?.discountType || item.discountType,
            discountValue: editedItem?.discountValue || item.discountValue,
            discountAmount: editedItem?.discountValue || item.discountValue || 0,
          }
        }),
        paymentStatus: formData.paymentStatus,
        paymentCategory: formData.paymentCategory,
        type: purchaseOrder.type || "MANUAL",
        status: formData.paymentStatus,
        paidAmount: formData.paidAmount,
        linkPayment: formData.linkPayment,
        deductibleWalletAmount: formData.deductibleWalletAmount,
        orderStatus: formData.orderStatus,
        discount: formData.discount,
        // Add discountDto for order-level discount - FIXED to match backend expectation
        discountDto:
          formData.discount > 0
            ? {
                discountType: formData.discountType === "PERCENTAGE" ? "Percentage" : "Amount",
                discountValue: formData.discount,
                discountedAmount: orderDiscountedAmount,
              }
            : undefined,
      }

      const response = await dispatch(updatePaymentStatus(updateData)).unwrap()

      notify("success", response.message || "All changes saved successfully")
      setIsEditing(false)
      dispatch(fetchPurchaseOrderById(id))
    } catch (error: any) {
      console.error("Failed to save changes:", error)
      notify("error", "Failed to save changes", {
        description: error.message || "Please try again or contact support if the issue persists",
      })
    }
  }, [dispatch, id, purchaseOrder, formData, editingItems, calculateOrderTotals])

  const handleSendPurchase = useCallback(async () => {
    if (!purchaseOrder) return

    try {
      // Calculate totals for sending
      const {
        subtotal,
        totalItemDiscount,
        orderDiscount,
        totalTax,
        totalAmount,
        totalAmountWithTax,
        orderDiscountedAmount,
        netAmountBeforeTax,
        totalAmountWithTaxBeforeOrderDiscount,
      } = calculateOrderTotals()

      const sendData = {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        supplierId: purchaseOrder.supplierId,
        orderDate: purchaseOrder.orderDate,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        totalAmount: totalAmount, // This should be the subtotal (₹59.70)
        totalAmountWithTax: totalAmountWithTax,
        raised: purchaseOrder.raised,
        purchaseOrderItems: purchaseOrder.purchaseOrderItems.map((item) => {
          const editedItem = editingItems.find((editItem) => editItem.purchaseOrderItemId === item.purchaseOrderItemId)
          return {
            itemDetails: {
              ...item.itemDetails,
              discountType: editedItem?.discountType || item.itemDetails?.discountType || "Percentage",
              saleDiscount: editedItem?.discountValue || item.itemDetails?.saleDiscount || 0,
            },
            purchaseOrderItemId: item.purchaseOrderItemId,
            productId: item.productId || 0,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            statusOfItem: editedItem?.statusOfItem || item.statusOfItem || "ACTIVE",
            defectQuantity: editedItem?.defectQuantity || item.defectQuantity || 0,
            // Include discount fields for API
            discountType: editedItem?.discountType || item.discountType,
            discountValue: editedItem?.discountValue || item.discountValue,
            discountAmount: editedItem?.discountValue || item.discountValue || 0,
          }
        }),
        paymentStatus: "PENDING",
        paymentCategory: purchaseOrder.paymentCategory || "CASH",
        type: purchaseOrder.type || "MANUAL",
        status: "REVIEWED",
        paidAmount: totalAmountWithTax,
        linkPayment: purchaseOrder.linkPayment || false,
        deductibleWalletAmount: purchaseOrder.deductibleWalletAmount || 0,
        orderStatus: "REVIEWED",
        discount: formData.discount,
        discountDto:
          formData.discount > 0
            ? {
                discountType: formData.discountType === "PERCENTAGE" ? "Percentage" : "Amount",
                discountValue: formData.discount,
                discountedAmount: orderDiscountedAmount,
              }
            : undefined,
      }

      const response = await dispatch(updatePaymentStatus(sendData)).unwrap()

      notify("success", response.message || "Purchase order sent successfully")
      dispatch(fetchPurchaseOrderById(id))
    } catch (error: any) {
      console.error("Failed to send purchase order:", error)
      notify("error", "Failed to send purchase order", {
        description: error.message || "Please try again or contact support if the issue persists",
      })
    }
  }, [dispatch, id, purchaseOrder, formData, editingItems, calculateOrderTotals])

  const handleCancelEdit = useCallback(() => {
    if (purchaseOrder) {
      setFormData({
        paymentStatus: purchaseOrder.paymentStatus || "",
        paymentCategory: purchaseOrder.paymentCategory || "",
        paidAmount: purchaseOrder.paidAmount || 0,
        linkPayment: purchaseOrder.linkPayment || false,
        deductibleWalletAmount: purchaseOrder.deductibleWalletAmount || 0,
        orderStatus: purchaseOrder.orderStatus || "",
        discount: purchaseOrder.discount || 0,
        discountType: purchaseOrder.discountDto?.discountType === "Percentage" ? "PERCENTAGE" : "AMOUNT",
      })

      // Reset to original values
      setEditingItems(
        purchaseOrder.purchaseOrderItems.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          statusOfItem: item.statusOfItem || "ACTIVE",
          defectQuantity: item.defectQuantity || 0,
          discountType: item.discountType || item.itemDetails?.discountType || "Percentage",
          discountValue: item.discountValue || item.itemDetails?.saleDiscount || 0,
        }))
      )
    }
    setIsEditing(false)
    notify("info", "Edit cancelled", {
      description: "Changes were not saved",
    })
  }, [purchaseOrder])

  // Handle item editing
  const handleItemStatusChange = useCallback((itemId: number, newStatus: string) => {
    setEditingItems((prev) =>
      prev.map((item) => (item.purchaseOrderItemId === itemId ? { ...item, statusOfItem: newStatus } : item))
    )
  }, [])

  const handleDefectQuantityChange = useCallback((itemId: number, newQuantity: number) => {
    setEditingItems((prev) =>
      prev.map((item) =>
        item.purchaseOrderItemId === itemId ? { ...item, defectQuantity: Math.max(0, newQuantity) } : item
      )
    )
  }, [])

  const handleDiscountTypeChange = useCallback((itemId: number, newDiscountType: string) => {
    setEditingItems((prev) =>
      prev.map((item) => (item.purchaseOrderItemId === itemId ? { ...item, discountType: newDiscountType } : item))
    )
  }, [])

  const handleDiscountValueChange = useCallback((itemId: number, newDiscountValue: number) => {
    setEditingItems((prev) =>
      prev.map((item) =>
        item.purchaseOrderItemId === itemId ? { ...item, discountValue: Math.max(0, newDiscountValue) } : item
      )
    )
  }, [])

  // Memoize these functions since they don't depend on component state
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
      case "CREATED":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
      case "CANCELLED":
      case "FAILED":
      case "OVERDUE":
        return "bg-red-100 text-red-800"
      case "DEFAULT":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  const getPaymentStatusColor = useCallback((status: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
      case "OVERDUE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  // Calculate order summary for display
  const orderSummary = useMemo(() => {
    return calculateOrderTotals()
  }, [calculateOrderTotals])

  // Skeleton Loading Components
  const SkeletonHeader = () => (
    <div className="mb-6 animate-pulse">
      <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
      <div className="h-4 w-64 rounded bg-gray-200"></div>
    </div>
  )

  const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex justify-between">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  )

  const SkeletonTable = () => (
    <div className="mt-8 animate-pulse">
      <div className="mb-4 h-6 w-40 rounded bg-gray-200"></div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <th key={item} className="px-6 py-3 text-left">
                  <div className="h-4 w-20 rounded bg-gray-300"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[1, 2, 3].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                  <td key={cell} className="whitespace-nowrap px-6 py-4">
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading) {
    return (
      <>
        <DashboardNav />
        <NotificationProvider />
        <div className="min-h-screen bg-[#F4F9F8] p-3 md:p-8">
          <div className="mx-auto w-full">
            <SkeletonHeader />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonTable />
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <DashboardNav />
        <NotificationProvider />
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 p-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Error Loading Purchase Order</h2>
            <p className="text-gray-600">{error}</p>
            <ButtonModule
              onClick={() => window.history.back()}
              variant="outline"
              icon={<FiArrowLeft />}
              iconPosition="start"
            >
              Go Back
            </ButtonModule>
          </div>
        </div>
      </>
    )
  }

  if (!purchaseOrder) {
    return (
      <>
        <DashboardNav />
        <NotificationProvider />
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Purchase Order Not Found</h2>
            <p className="text-gray-600">The requested purchase order could not be found.</p>
            <ButtonModule
              onClick={() => window.history.back()}
              variant="outline"
              icon={<FiArrowLeft />}
              iconPosition="start"
            >
              Go Back
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
      <div className="min-h-screen bg-[#F4F9F8] p-3 md:p-8">
        <div className="w-full">
          {/* Header Section */}
          <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <ButtonModule
                onClick={() => window.history.back()}
                variant="ghost"
                size="sm"
                icon={<FiArrowLeft />}
                iconPosition="start"
                className="mb-4 md:mb-0"
              >
                Back to Orders
              </ButtonModule>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Purchase Order Details</h1>
              <p className="mt-1 text-gray-600">Order ID: #{purchaseOrder.purchaseOrderId}</p>
            </div>
            <div className="mt-4 flex space-x-2 md:mt-0">
              <ButtonModule
                onClick={handlePrint}
                variant="outline"
                size="md"
                className="rounded-lg"
                icon={<FiPrinter />}
                iconPosition="start"
              >
                Print
              </ButtonModule>
              <ButtonModule
                className="rounded-lg"
                variant="outline"
                size="md"
                icon={<FiDownload />}
                iconPosition="start"
              >
                Download
              </ButtonModule>
              {!isEditing ? (
                <ButtonModule
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  size="md"
                  icon={<FiEdit />}
                  iconPosition="start"
                  aria-label="Edit Purchase Order"
                  className="rounded-lg"
                >
                  Edit
                </ButtonModule>
              ) : (
                <div className="flex space-x-2">
                  <ButtonModule
                    onClick={handleSaveAll}
                    disabled={updatingPaymentStatus}
                    variant="primary"
                    className="rounded-lg"
                    size="md"
                    icon={<FiSave />}
                    iconPosition="start"
                    aria-label="Save All Changes"
                  >
                    {updatingPaymentStatus ? "Saving..." : "Save All"}
                  </ButtonModule>
                  <ButtonModule
                    onClick={handleCancelEdit}
                    variant="danger"
                    className="rounded-lg"
                    size="md"
                    icon={<FiX />}
                    iconPosition="start"
                    aria-label="Cancel Edit"
                  >
                    Cancel
                  </ButtonModule>
                </div>
              )}
              {!isOrderApproved && (
                <ButtonModule
                  className="rounded-lg"
                  onClick={handleSendPurchase}
                  disabled={updatingPaymentStatus}
                  variant="primary"
                  size="md"
                  icon={<FiSend />}
                  iconPosition="start"
                  aria-label="Send Purchase Order"
                >
                  {updatingPaymentStatus ? "Sending..." : "Send Purchase"}
                </ButtonModule>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3">
                  <FiDollarSign className="text-blue-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-semibold">₹{orderSummary.totalAmountWithTax.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-green-100 p-3">
                  <FiCheckCircle className="text-green-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Order Status</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                      purchaseOrder.orderStatus
                    )}`}
                  >
                    {purchaseOrder.orderStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-100 p-3">
                  <FiBox className="text-purple-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="text-lg font-semibold">{purchaseOrder.purchaseOrderItems.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center">
                <div className="rounded-lg bg-orange-100 p-3">
                  <FiClock className="text-orange-600" size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPaymentStatusColor(
                      purchaseOrder.paymentStatus
                    )}`}
                  >
                    {purchaseOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Order Information Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-transform hover:shadow-md">
              <h2 className="mb-4 flex items-center text-lg font-semibold">
                <FiBox className="mr-2 text-blue-600" /> Order Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Order ID</span>
                  <span className="font-semibold">#{purchaseOrder.purchaseOrderId}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Supplier</span>
                  <span className="font-semibold">{supplierName}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Order Date</span>
                  <span className="font-semibold">{formatDate(purchaseOrder.orderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Expected Delivery</span>
                  <span className="font-semibold">
                    {purchaseOrder.expectedDeliveryDate
                      ? formatDate(purchaseOrder.expectedDeliveryDate)
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-transform hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center text-lg font-semibold">
                  <FiDollarSign className="mr-2 text-green-600" /> Payment Information
                </h2>
              </div>
              {updatePaymentStatusError && (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{updatePaymentStatusError}</div>
              )}
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>

                {/* Item-level Discount Summary */}
                {orderSummary.totalItemDiscount > 0 && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-600">Item Discounts</span>
                    <span className="font-semibold text-red-600">-₹{orderSummary.totalItemDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Amount after item discounts */}
                {orderSummary.totalItemDiscount > 0 && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-600">Amount After Item Discounts</span>
                    <span className="font-semibold">
                      ₹{(orderSummary.subtotal - orderSummary.totalItemDiscount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Tax Amount</span>
                  <span className="font-semibold">₹{orderSummary.totalTax.toFixed(2)}</span>
                </div>

                {/* Final amount before order discount */}
                {/* <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Amount Before Order Discount</span>
                  <span className="font-semibold">
                    ₹{orderSummary.totalAmountWithTaxBeforeOrderDiscount.toFixed(2)}
                  </span>
                </div> */}

                {/* Order-level Discount Section */}
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Order Discount</span>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm"
                      >
                        <option value="AMOUNT">₹</option>
                        <option value="PERCENTAGE">%</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                        className="w-24 rounded border border-gray-300 bg-transparent px-2 py-1 text-right"
                      />
                    </div>
                  ) : (
                    <span className="font-semibold">
                      {purchaseOrder.discount
                        ? `${
                            purchaseOrder.discountDto?.discountType === "Percentage"
                              ? `${purchaseOrder.discount}%`
                              : `₹${purchaseOrder.discount.toFixed(2)}`
                          }`
                        : "No discount"}
                    </span>
                  )}
                </div>

                {/* Show order discount amount if applied */}
                {orderSummary.orderDiscount > 0 && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="font-medium text-gray-600">Order Discount Amount</span>
                    <span className="font-semibold text-red-600">-₹{orderSummary.orderDiscount.toFixed(2)}</span>
                    {/* <span className="ml-2 text-xs text-gray-500">
                      (
                      {formData.discountType === "PERCENTAGE"
                        ? `${formData.discount}% of ₹${orderSummary.totalAmountWithTaxBeforeOrderDiscount.toFixed(2)}`
                        : ""}
                      )
                    </span> */}
                  </div>
                )}

                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Final Amount</span>
                  <span className="font-semibold">₹{orderSummary.totalAmountWithTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Payment Status</span>
                  {isEditing ? (
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="rounded border border-gray-300 bg-transparent px-2 py-1"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusColor(
                        purchaseOrder.paymentStatus
                      )}`}
                    >
                      {purchaseOrder.paymentStatus}
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Payment Category</span>
                  {isEditing ? (
                    <select
                      value={formData.paymentCategory}
                      onChange={(e) => setFormData({ ...formData, paymentCategory: e.target.value })}
                      className="rounded border border-gray-300 bg-transparent px-2 py-1"
                    >
                      <option value="CASH">CASH</option>
                      <option value="CARD">CARD</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    </select>
                  ) : (
                    <span className="font-semibold">{purchaseOrder.paymentCategory || "Not specified"}</span>
                  )}
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Order Status</span>
                  {isEditing ? (
                    <select
                      value={formData.orderStatus}
                      onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                      className="rounded border border-gray-300 bg-transparent px-2 py-1"
                    >
                      <option value="CREATED">CREATED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="REVIEWED">REVIEWED</option>
                    </select>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        purchaseOrder.orderStatus
                      )}`}
                    >
                      {purchaseOrder.orderStatus}
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Paid Amount</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                      className="w-24 rounded border border-gray-300 bg-transparent px-2 py-1 text-right"
                    />
                  ) : (
                    <span className="font-semibold">₹{(purchaseOrder.paidAmount || 0).toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Link Payment</span>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.linkPayment}
                      onChange={(e) => setFormData({ ...formData, linkPayment: e.target.checked })}
                      className="size-5 bg-transparent"
                    />
                  ) : (
                    <span className="font-semibold">{purchaseOrder.linkPayment ? "Yes" : "No"}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Deductible Wallet Amount</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.deductibleWalletAmount}
                      onChange={(e) => setFormData({ ...formData, deductibleWalletAmount: Number(e.target.value) })}
                      className="w-24 rounded border border-gray-300 bg-transparent px-2 py-1 text-right"
                    />
                  ) : (
                    <span className="font-semibold">₹{(purchaseOrder.deductibleWalletAmount || 0).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm transition-transform hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center text-lg font-semibold">
                <FiBox className="mr-2 text-purple-600" /> Order Items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                    {isEditing && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Discount Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Discount Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Defect Qty
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {purchaseOrder.purchaseOrderItems.map((item) => {
                    const editedItem = editingItems.find(
                      (editItem) => editItem.purchaseOrderItemId === item.purchaseOrderItemId
                    ) || {
                      purchaseOrderItemId: item.purchaseOrderItemId,
                      statusOfItem: item.statusOfItem || "ACTIVE",
                      defectQuantity: item.defectQuantity || 0,
                      discountType: item.discountType || item.itemDetails?.discountType || "Percentage",
                      discountValue: item.discountValue || item.itemDetails?.saleDiscount || 0,
                    }

                    const itemTotal = item.quantity * item.unitPrice
                    const discountedTotal = calculateItemDiscountedPrice(item, editedItem)

                    return (
                      <React.Fragment key={item.purchaseOrderItemId}>
                        <tr className="transition-colors hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex size-10 items-center justify-center rounded-md bg-gray-100">
                                <FiBox className="text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {item.itemDetails?.productName || "Product"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.itemDetails?.description || "No description available"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 font-medium">₹{item.unitPrice.toFixed(2)}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-medium">
                            <div className="flex flex-col">
                              <span
                                className={`${
                                  discountedTotal < itemTotal ? "text-sm text-red-600 line-through" : "font-medium"
                                }`}
                              >
                                ₹{itemTotal.toFixed(2)}
                              </span>
                              {discountedTotal < itemTotal && (
                                <span className="font-medium text-green-600">₹{discountedTotal.toFixed(2)}</span>
                              )}
                            </div>
                          </td>
                          {isEditing && (
                            <>
                              <td className="whitespace-nowrap px-6 py-4">
                                <select
                                  value={editedItem.discountType}
                                  onChange={(e) => handleDiscountTypeChange(item.purchaseOrderItemId, e.target.value)}
                                  className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm"
                                >
                                  <option value="Percentage">Percentage</option>
                                  <option value="Amount">Amount</option>
                                </select>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <input
                                  type="number"
                                  min="0"
                                  step={editedItem.discountType === "Percentage" ? "0.1" : "1"}
                                  value={editedItem.discountValue}
                                  onChange={(e) =>
                                    handleDiscountValueChange(item.purchaseOrderItemId, parseFloat(e.target.value) || 0)
                                  }
                                  className="w-20 rounded border border-gray-300 bg-transparent px-2 py-1 text-right text-sm"
                                />
                                <span className="ml-1 text-xs text-gray-500">
                                  {editedItem.discountType === "Percentage" ? "%" : "₹"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <select
                                  value={editedItem.statusOfItem}
                                  onChange={(e) => handleItemStatusChange(item.purchaseOrderItemId, e.target.value)}
                                  className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm"
                                >
                                  <option value="DEFAULT">Default</option>
                                  {returnReasonsLoading ? (
                                    <option value="" disabled>
                                      Loading return reasons...
                                    </option>
                                  ) : returnReasons && returnReasons.length > 0 ? (
                                    returnReasons.map((reason) => (
                                      <option key={reason.purchaseReturnReasonId} value={reason.reasonType}>
                                        {reason.reasonType}
                                      </option>
                                    ))
                                  ) : (
                                    <option value="" disabled>
                                      No return reasons available
                                    </option>
                                  )}
                                </select>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.quantity}
                                  value={editedItem.defectQuantity}
                                  onChange={(e) =>
                                    handleDefectQuantityChange(item.purchaseOrderItemId, parseInt(e.target.value) || 0)
                                  }
                                  className="w-20 rounded border border-gray-300 bg-transparent px-2 py-1 text-right text-sm"
                                />
                              </td>
                            </>
                          )}
                          <td className="whitespace-nowrap px-6 py-4">
                            <button
                              onClick={() => toggleItemExpansion(item.purchaseOrderItemId)}
                              className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                              aria-label="Toggle product details"
                            >
                              <FiInfo size={16} />
                            </button>
                          </td>
                        </tr>
                        {expandedItems.includes(item.purchaseOrderItemId) && item.itemDetails && (
                          <tr className="bg-gray-50">
                            <td colSpan={isEditing ? 9 : 5} className="px-6 py-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="flex items-start">
                                  <FiTag className="mr-2 mt-1 text-blue-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Batch No</p>
                                    <p className="text-sm">{item.itemDetails.batchNo || "N/A"}</p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiAward className="mr-2 mt-1 text-green-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Manufacturer</p>
                                    <p className="text-sm">{item.itemDetails.manufacturer || "N/A"}</p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiCalendarIcon className="mr-2 mt-1 text-purple-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                                    <p className="text-sm">
                                      {item.itemDetails.expDate ? formatDate(item.itemDetails.expDate) : "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiCodesandbox className="mr-2 mt-1 text-orange-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Packaging</p>
                                    <p className="text-sm">
                                      {item.itemDetails.packagingSize
                                        ? `${item.itemDetails.packagingSize} units`
                                        : "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiMapPin className="mr-2 mt-1 text-red-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Location</p>
                                    <p className="text-sm">{item.itemDetails.itemLocation || "N/A"}</p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiPieChart className="mr-2 mt-1 text-indigo-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Tax Rate</p>
                                    <p className="text-sm">
                                      {item.itemDetails.taxRate ? `${item.itemDetails.taxRate}%` : "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiLayers className="mr-2 mt-1 text-teal-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">HSN Code</p>
                                    <p className="text-sm">{item.itemDetails.hsn || "N/A"}</p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiShoppingBag className="mr-2 mt-1 text-amber-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">MRP</p>
                                    <p className="text-sm">
                                      {item.itemDetails.mrp ? `₹${parseFloat(item.itemDetails.mrp).toFixed(2)}` : "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiPercent className="mr-2 mt-1 text-purple-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Discount Type</p>
                                    <p className="text-sm">{item.itemDetails?.discountType || "Percentage"}</p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <FiDollarSign className="mr-2 mt-1 text-green-500" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Discount Value</p>
                                    <p className="text-sm">
                                      {item.itemDetails?.saleDiscount
                                        ? `${item.itemDetails.saleDiscount}${
                                            item.itemDetails?.discountType === "Percentage" ? "%" : "₹"
                                          }`
                                        : "0%"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={isEditing ? 4 : 3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Subtotal
                    </td>
                    <td
                      className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
                      colSpan={isEditing ? 5 : 1}
                    >
                      ₹{orderSummary.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  {orderSummary.totalItemDiscount > 0 && (
                    <tr>
                      <td
                        colSpan={isEditing ? 4 : 3}
                        className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                      >
                        Item Discounts
                      </td>
                      <td
                        className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600"
                        colSpan={isEditing ? 5 : 1}
                      >
                        -₹{orderSummary.totalItemDiscount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {orderSummary.orderDiscount > 0 && (
                    <tr>
                      <td
                        colSpan={isEditing ? 4 : 3}
                        className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                      >
                        Order Discount
                      </td>
                      <td
                        className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600"
                        colSpan={isEditing ? 5 : 1}
                      >
                        -₹{orderSummary.orderDiscount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={isEditing ? 4 : 3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Tax Amount
                    </td>
                    <td
                      className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
                      colSpan={isEditing ? 5 : 1}
                    >
                      ₹{orderSummary.totalTax.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={isEditing ? 4 : 3} className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                      Grand Total
                    </td>
                    <td
                      className="whitespace-nowrap px-6 py-4 text-lg font-bold text-gray-900"
                      colSpan={isEditing ? 5 : 1}
                    >
                      ₹{orderSummary.totalAmountWithTax.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col justify-end space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            {!isEditing ? (
              <ButtonModule
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="rounded-lg"
                size="md"
                icon={<FiEdit />}
                iconPosition="start"
                aria-label="Edit Purchase Order"
              >
                Edit
              </ButtonModule>
            ) : (
              <div className="flex space-x-2">
                <ButtonModule
                  onClick={handleSaveAll}
                  disabled={updatingPaymentStatus}
                  variant="primary"
                  className="rounded-lg"
                  size="md"
                  icon={<FiSave />}
                  iconPosition="start"
                  aria-label="Save All Changes"
                >
                  {updatingPaymentStatus ? "Saving..." : "Save All"}
                </ButtonModule>
                <ButtonModule
                  onClick={handleCancelEdit}
                  className="rounded-lg"
                  variant="danger"
                  size="md"
                  icon={<FiX />}
                  iconPosition="start"
                  aria-label="Cancel Edit"
                >
                  Cancel
                </ButtonModule>
              </div>
            )}
            {!isOrderApproved && (
              <ButtonModule
                className="rounded-lg"
                onClick={handleSendPurchase}
                disabled={updatingPaymentStatus}
                variant="primary"
                size="md"
                icon={<FiSend />}
                iconPosition="start"
                aria-label="Send Purchase Order"
              >
                {updatingPaymentStatus ? "Sending..." : "Send Purchase"}
              </ButtonModule>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default PurchaseOrderDetails
