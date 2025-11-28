"use client"

import React, { useRef } from "react"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import PdfFile from "public/pdf-file"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { FiCalendar, FiCreditCard, FiDollarSign, FiPackage, FiUser } from "react-icons/fi"
import { format } from "date-fns"
import { PurchaseOrderItem, TransactionDetailsResponse } from "app/api/store/productSlice"

interface Transaction {
  id: string
  type: string
  customerId: string
  name: string
  date: string
  amount: number
  invoiceNumber: string
  status: "Pending" | "Completed" | "Failed" | "Processing"
  quantity: number
  pricePerUnit: number
  unit: string
}

interface SaleOrderItem {
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
  saleOrderId: string | null
  statusOfItem: string | null
  defectQuantity: number | null
  unitName: string
  unitSold: number
  totalRevenue: number | null
  discountType: string | null
  discountValue: number
}

// Use TransactionDetailsResponse from slice for consistency

interface TransactionDetailsModalProps {
  isOpen: boolean
  transaction: Transaction | null
  transactionDetails: TransactionDetailsResponse | null
  loading: boolean
  error: string | null
  onRequestClose: () => void
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  transaction,
  transactionDetails,
  loading,
  error,
  onRequestClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!modalRef.current) return

    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Transaction_Details_${transaction?.invoiceNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy")
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "₹0.00"
    return `₹${amount.toFixed(2)}`
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
      case "APPROVED":
      case "CREATED":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusText = (paymentStatusId: number) => {
    switch (paymentStatusId) {
      case 1:
        return "Paid"
      case 2:
        return "Pending"
      case 3:
        return "Failed"
      default:
        return "Unknown"
    }
  }

  const getPaymentStatusStyle = (status: string | number) => {
    if (typeof status === "number") {
      switch (status) {
        case 1:
          return "bg-green-100 text-green-800"
        case 2:
          return "bg-yellow-100 text-yellow-800"
        case 3:
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    } else {
      switch (status) {
        case "PAID":
          return "bg-green-100 text-green-800"
        case "PENDING":
          return "bg-yellow-100 text-yellow-800"
        case "FAILED":
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }
  }

  const getPaymentTypeText = (paymentTypeId: number) => {
    switch (paymentTypeId) {
      case 1:
        return "Cash"
      case 2:
        return "Card"
      case 3:
        return "UPI"
      case 4:
        return "Wallet"
      default:
        return "Other"
    }
  }

  const calculateItemTotal = (item: SaleOrderItem) => {
    return item.pricePerUnit * item.quantity + (item.pricePerUnit * item.quantity * item.tax) / 100
  }

  const calculatePurchaseItemTotal = (item: PurchaseOrderItem) => {
    return item.unitPrice * item.quantity + (item.unitPrice * item.quantity * (item.itemDetails.taxRate || 0)) / 100
  }

  const isPurchaseOrder = transactionDetails?.orderType === "purchase"
  const isSaleOrder = transactionDetails?.orderType === "sale"

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-[90vh] w-[1200px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      ariaHideApp={false}
    >
      <div ref={modalRef} className="flex w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="size-12 animate-pulse rounded-full bg-gray-200" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                <FiDollarSign className="size-6 text-blue-500" />
              </div>
            )}
            <div>
              {loading ? (
                <>
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {isPurchaseOrder ? "Purchase" : "Sales"} Transaction Details
                  </h2>
                  <p className="text-sm text-gray-500">Order Type: {transactionDetails?.orderType || "N/A"}</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onRequestClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-6">
              {/* Transaction Summary Skeleton */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Skeleton */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-3 h-5 w-20 animate-pulse rounded bg-gray-200" />
                <div className="space-y-3">
                  {[1, 2].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-red-500">
              Failed to load transaction details: {error}
            </div>
          ) : transactionDetails ? (
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Transaction Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  {isPurchaseOrder ? (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">Purchase Order ID</p>
                        <p className="text-sm font-medium text-gray-800">
                          {transactionDetails.transaction.purchaseOrderId || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">Supplier ID</p>
                        <p className="text-sm font-medium text-gray-800">
                          {transactionDetails.transaction.supplierId || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">Order Date</p>
                        <p className="text-sm font-medium text-gray-800">
                          {transactionDetails.transaction.orderDate
                            ? formatDate(transactionDetails.transaction.orderDate)
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">Order Status</p>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                            transactionDetails.transaction.orderStatus || transactionDetails.transaction.status || "N/A"
                          )}`}
                        >
                          {transactionDetails.transaction.orderStatus || transactionDetails.transaction.status || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">Payment Status</p>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusStyle(
                            transactionDetails.transaction.paymentStatus || "N/A"
                          )}`}
                        >
                          {transactionDetails.transaction.paymentStatus || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatCurrency(transactionDetails.transaction.totalAmount)}
                        </p>
                      </div>
                    </>
                  ) : isSaleOrder ? (
                    <>
                      <div>
                        <p className="text-xs text-gray-500">Customer ID</p>
                        <p className="text-sm font-medium text-gray-800">
                          {transactionDetails.transaction.customerId || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Order Status</p>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                            transactionDetails.transaction.orderStatus || "N/A"
                          )}`}
                        >
                          {transactionDetails.transaction.orderStatus || "N/A"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Status</p>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusStyle(
                            transactionDetails.transaction.paymentStatusId || "N/A"
                          )}`}
                        >
                          {transactionDetails.transaction.paymentStatusId
                            ? getPaymentStatusText(transactionDetails.transaction.paymentStatusId)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Type</p>
                        <p className="text-sm font-medium text-gray-800">
                          {transactionDetails.transaction.paymentTypeId
                            ? getPaymentTypeText(transactionDetails.transaction.paymentTypeId)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid Amount</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatCurrency(transactionDetails.transaction.paidAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Return Status</p>
                        <p className="text-sm font-medium text-gray-800">
                          {transactionDetails.transaction.returnStatus || "N/A"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-center text-gray-500">Unknown order type</div>
                  )}
                </div>
              </div>

              {/* Items Section - Purchase Order in Table Format */}
              {isPurchaseOrder &&
                transactionDetails.transaction.purchaseOrderItems &&
                transactionDetails.transaction.purchaseOrderItems.length > 0 && (
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">Purchase Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Product
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              HSN Code
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Batch No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Manufacturer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Unit Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Tax Rate
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              MRP
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Sale Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {transactionDetails.transaction.purchaseOrderItems.map(
                            (item: PurchaseOrderItem, index: number) => (
                              <tr key={item.purchaseOrderItemId || index} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-4 py-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">{item.itemDetails.productName}</p>
                                    <p className="text-xs text-gray-500">{item.itemDetails.description}</p>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                                  {item.itemDetails.hsn}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                                  {item.itemDetails.batchNo}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                                  {item.itemDetails.manufacturer}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                                  {item.itemDetails.taxRate}%
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                                  {formatCurrency(item.itemDetails.mrp)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                                  {formatCurrency(item.itemDetails.salePrice)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
                                  {formatCurrency(calculatePurchaseItemTotal(item))}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td
                              colSpan={9}
                              className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-800"
                            >
                              Grand Total:
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-gray-800">
                              {formatCurrency(
                                transactionDetails.transaction.purchaseOrderItems.reduce(
                                  (total, item) => total + calculatePurchaseItemTotal(item),
                                  0
                                )
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Additional Item Details in Grid Format */}
                    <div className="mt-4 rounded border bg-white p-4">
                      <h4 className="mb-3 text-xs font-semibold text-gray-700">Additional Item Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        {transactionDetails.transaction.purchaseOrderItems.map(
                          (item: PurchaseOrderItem, index: number) => (
                            <div key={item.purchaseOrderItemId || index} className="rounded border p-3">
                              <p className="text-sm font-medium text-gray-800">{item.itemDetails.productName}</p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-gray-500">MFG Date:</span>
                                  <span className="ml-1 font-medium">{formatDate(item.itemDetails.mfgDate)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">EXP Date:</span>
                                  <span className="ml-1 font-medium">{formatDate(item.itemDetails.expDate)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {isSaleOrder &&
                transactionDetails.transaction.saleOrderItems &&
                transactionDetails.transaction.saleOrderItems.length > 0 && (
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">Sale Order Items</h3>
                    <div className="space-y-4">
                      {transactionDetails.transaction.saleOrderItems.map((item: SaleOrderItem, index: number) => (
                        <div key={item.saleOrderItemId || index} className="rounded border bg-white p-3">
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-800">
                              {formatCurrency(calculateItemTotal(item))}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">HSN Code:</span>
                              <span className="ml-1 font-medium">{item.hsnCode}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Batch No:</span>
                              <span className="ml-1 font-medium">{item.batchNo}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Manufacturer:</span>
                              <span className="ml-1 font-medium">{item.mfg}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Packing:</span>
                              <span className="ml-1 font-medium">{item.packing}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">MFG Date:</span>
                              <span className="ml-1 font-medium">{formatDate(item.mfgDate)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">EXP Date:</span>
                              <span className="ml-1 font-medium">{formatDate(item.expDate)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <span className="ml-1 font-medium">
                                {item.quantity} {item.unitName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Price per Unit:</span>
                              <span className="ml-1 font-medium">{formatCurrency(item.pricePerUnit)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">MRP:</span>
                              <span className="ml-1 font-medium">{formatCurrency(item.mrp)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tax:</span>
                              <span className="ml-1 font-medium">{item.tax}%</span>
                            </div>
                            {item.discountValue > 0 && (
                              <div>
                                <span className="text-gray-500">Discount:</span>
                                <span className="ml-1 font-medium">{formatCurrency(item.discountValue)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Additional Details */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {isPurchaseOrder ? (
                    <>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Expected Delivery</p>
                          <p className="text-sm font-medium text-gray-800">
                            {transactionDetails.transaction.expectedDeliveryDate
                              ? formatDate(transactionDetails.transaction.expectedDeliveryDate)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCreditCard className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Payment Category</p>
                          <p className="text-sm font-medium text-gray-800">
                            {transactionDetails.transaction.paymentCategory || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Discount</p>
                          <p className="text-sm font-medium text-gray-800">
                            {formatCurrency(transactionDetails.transaction.discount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPackage className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Raised</p>
                          <p className="text-sm font-medium text-gray-800">
                            {transactionDetails.transaction.raised ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : isSaleOrder ? (
                    <>
                      <div className="flex items-center gap-2">
                        <FiCreditCard className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Link Payment</p>
                          <p className="text-sm font-medium text-gray-800">
                            {transactionDetails.transaction.linkPayment ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Place of Supply</p>
                          <p className="text-sm font-medium text-gray-800">
                            {transactionDetails.transaction.placeOfSupply || "N/A"}
                          </p>
                        </div>
                      </div>
                      {transactionDetails.transaction.deductibleWalletAmount !== null && (
                        <div className="flex items-center gap-2">
                          <FiUser className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Wallet Amount</p>
                            <p className="text-sm font-medium text-gray-800">
                              {formatCurrency(transactionDetails.transaction.deductibleWalletAmount)}
                            </p>
                          </div>
                        </div>
                      )}
                      {transactionDetails.transaction.promoCode && (
                        <div className="flex items-center gap-2">
                          <FiPackage className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Promo Code</p>
                            <p className="text-sm font-medium text-gray-800">
                              {transactionDetails.transaction.promoCode}
                            </p>
                          </div>
                        </div>
                      )}
                      {transactionDetails.transaction.loyaltyPointDiscount !== null && (
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Loyalty Discount</p>
                            <p className="text-sm font-medium text-gray-800">
                              {formatCurrency(transactionDetails.transaction.loyaltyPointDiscount)}
                            </p>
                          </div>
                        </div>
                      )}
                      {transactionDetails.transaction.subscriptionDiscount !== null && (
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Subscription Discount</p>
                            <p className="text-sm font-medium text-gray-800">
                              {formatCurrency(transactionDetails.transaction.subscriptionDiscount)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Basic Transaction Info */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-800">{transaction.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Invoice #</p>
                    <p className="text-sm font-medium text-gray-800">{transaction.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(transaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Customer/Supplier</p>
                    <p className="text-sm font-medium text-gray-800">{transaction.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm font-medium text-gray-800">{formatCurrency(transaction.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Item Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity</span>
                    <span className="text-sm font-medium text-gray-800">
                      {transaction.quantity} {transaction.unit || "units"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price per Unit</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatCurrency(transaction.pricePerUnit || transaction.amount / transaction.quantity)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium text-gray-800">Total</span>
                    <span className="text-sm font-medium text-gray-800">{formatCurrency(transaction.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500">No transaction data available</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t p-4">
          <ButtonModule
            variant="outline"
            size="md"
            icon={<PdfFile />}
            iconPosition="start"
            onClick={handleDownloadPDF}
            className="border-gray-300 hover:bg-gray-50"
          >
            Download PDF
          </ButtonModule>
          <div className="flex gap-2">
            <ButtonModule variant="ghost" size="md" onClick={onRequestClose}>
              Close
            </ButtonModule>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TransactionDetailsModal
