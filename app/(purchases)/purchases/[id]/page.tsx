"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  fetchPurchaseOrderById,
  selectCurrentPurchaseOrder,
  selectCurrentPurchaseOrderLoading,
  selectCurrentPurchaseOrderError,
  clearCurrentPurchaseOrder,
  updatePaymentStatus,
  selectUpdatingPaymentStatus,
  selectUpdatePaymentStatusError,
  fetchPurchaseReturnReasons,
  selectPurchaseReturnReasons,
  selectPurchaseReturnReasonsLoading,
} from "app/api/store/purchaseSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { NotificationProvider, notify } from "components/ui/Notification/Notification"

import {
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiDollarSign,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiEdit,
  FiSave,
  FiX,
  FiSend,
  FiInfo,
  FiTag,
  FiCodesandbox,
  FiCalendar as FiCalendarIcon,
  FiAward,
  FiMapPin,
  FiPieChart,
  FiShoppingBag,
  FiLayers,
  FiPercent,
} from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"

interface ItemEditState {
  purchaseOrderItemId: number
  statusOfItem: string
  defectQuantity: number
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
        discountType: "AMOUNT", // Default to amount, can be enhanced to detect type
      })

      // Initialize editing items with current values
      setEditingItems(
        purchaseOrder.purchaseOrderItems.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          statusOfItem: item.statusOfItem || "ACTIVE",
          defectQuantity: item.defectQuantity || 0,
        }))
      )
    }
  }, [purchaseOrder])

  const toggleItemExpansion = useCallback((itemId: number) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const calculateDiscountedTotal = useCallback(() => {
    if (!purchaseOrder) return 0

    const subtotal = purchaseOrder.totalAmount
    const discount = formData.discount || 0

    if (formData.discountType === "PERCENTAGE") {
      return subtotal - (subtotal * discount) / 100
    }

    return Math.max(0, subtotal - discount)
  }, [purchaseOrder, formData.discount, formData.discountType])

  const handleSaveAll = useCallback(async () => {
    if (!purchaseOrder) return

    try {
      const updateData = {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        supplierId: purchaseOrder.supplierId,
        orderDate: purchaseOrder.orderDate,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        totalAmount: calculateDiscountedTotal(),
        raised: purchaseOrder.raised,
        purchaseOrderItems: purchaseOrder.purchaseOrderItems.map((item) => {
          const editedItem = editingItems.find((editItem) => editItem.purchaseOrderItemId === item.purchaseOrderItemId)
          return {
            itemDetails: item.itemDetails,
            purchaseOrderItemId: item.purchaseOrderItemId,
            productId: item.productId || 0,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            statusOfItem: editedItem?.statusOfItem || item.statusOfItem || "ACTIVE",
            defectQuantity: editedItem?.defectQuantity || item.defectQuantity || 0,
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
  }, [dispatch, id, purchaseOrder, formData, editingItems, calculateDiscountedTotal])

  const handleSendPurchase = useCallback(async () => {
    if (!purchaseOrder) return

    try {
      const sendData = {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        supplierId: purchaseOrder.supplierId,
        orderDate: purchaseOrder.orderDate,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        totalAmount: purchaseOrder.totalAmount,
        raised: purchaseOrder.raised,
        purchaseOrderItems: purchaseOrder.purchaseOrderItems.map((item) => ({
          itemDetails: item.itemDetails,
          purchaseOrderItemId: item.purchaseOrderItemId,
          productId: item.productId || 0,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          statusOfItem: item.statusOfItem || "ACTIVE",
          defectQuantity: item.defectQuantity || 0,
        })),
        paymentStatus: purchaseOrder.paymentStatus || "PENDING",
        paymentCategory: purchaseOrder.paymentCategory || "CASH",
        type: purchaseOrder.type || "MANUAL",
        status: purchaseOrder.status || "REVIEWED",
        paidAmount: purchaseOrder.totalAmount,
        linkPayment: purchaseOrder.linkPayment || false,
        deductibleWalletAmount: purchaseOrder.deductibleWalletAmount || 0,
        orderStatus: purchaseOrder.orderStatus || "REVIEWED",
        discount: purchaseOrder.discount || 0,
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
  }, [dispatch, id, purchaseOrder])

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
        discountType: "AMOUNT",
      })

      // Reset to original values
      setEditingItems(
        purchaseOrder.purchaseOrderItems.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          statusOfItem: item.statusOfItem || "ACTIVE",
          defectQuantity: item.defectQuantity || 0,
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
              {[1, 2, 3, 4].map((item) => (
                <th key={item} className="px-6 py-3 text-left">
                  <div className="h-4 w-20 rounded bg-gray-300"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[1, 2, 3].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4].map((cell) => (
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
      <div className="min-h-screen  bg-[#F4F9F8] p-3 md:p-8">
        <div className=" w-full">
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
                  <p className="text-lg font-semibold">₹{purchaseOrder.totalAmount.toFixed(2)}</p>
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
                  <span className="font-medium text-gray-600">Supplier ID</span>
                  <span className="font-semibold">{purchaseOrder.supplierId}</span>
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
                  <span className="font-medium text-gray-600">Total Amount</span>
                  <span className="font-semibold">₹{purchaseOrder.totalAmount.toFixed(2)}</span>
                </div>

                {/* Discount Section */}
                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Discount</span>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="rounded border  border-gray-300 bg-transparent px-2 py-1 text-sm"
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
                      {purchaseOrder.discount ? `₹${purchaseOrder.discount.toFixed(2)}` : "No discount"}
                    </span>
                  )}
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Final Amount</span>
                  <span className="font-semibold">₹{calculateDiscountedTotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="font-medium text-gray-600">Payment Status</span>
                  {isEditing ? (
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="rounded border  border-gray-300 bg-transparent px-2 py-1"
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
                      className="rounded border  border-gray-300 bg-transparent px-2 py-1"
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
                      className="rounded border  border-gray-300  bg-transparent px-2 py-1"
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
                      className="h-5 w-5  bg-transparent"
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
                    ) || { statusOfItem: item.statusOfItem || "ACTIVE", defectQuantity: item.defectQuantity || 0 }

                    return (
                      <React.Fragment key={item.purchaseOrderItemId}>
                        <tr className="transition-colors hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                                <FiBox className="text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {item.productId ? `Product #${item.productId}` : `${item.itemDetails?.productName}`}
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
                            ₹{(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                          {isEditing && (
                            <>
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
                            <td colSpan={isEditing ? 7 : 5} className="px-6 py-4">
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
                      colSpan={isEditing ? 3 : 1}
                    >
                      ₹{(purchaseOrder.totalAmount ?? 0).toFixed(2)}
                    </td>
                  </tr>
                  {(purchaseOrder.discount ?? 0) > 0 && (
                    <tr>
                      <td
                        colSpan={isEditing ? 4 : 3}
                        className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                      >
                        Discount
                      </td>
                      <td
                        className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600"
                        colSpan={isEditing ? 3 : 1}
                      >
                        -₹{(purchaseOrder.discount ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={isEditing ? 4 : 3} className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                      Grand Total
                    </td>
                    <td
                      className="whitespace-nowrap px-6 py-4 text-lg font-bold text-gray-900"
                      colSpan={isEditing ? 3 : 1}
                    >
                      ₹{calculateDiscountedTotal().toFixed(2)}
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
