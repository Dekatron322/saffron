import React, { useEffect, useState } from "react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  clearReturnNote,
  createReturnNote,
  fetchPurchaseLedgers,
  fetchPurchaseReturnReasons,
  selectCreateReturnNoteError,
  selectCreatingReturnNote,
  selectPurchaseLedgersError,
  selectPurchaseLedgersLoading,
  selectPurchaseLedgersGrouped,
  selectPurchaseReturnReasons,
  selectPurchaseReturnReasonsError,
  selectPurchaseReturnReasonsLoading,
} from "app/api/store/purchaseSlice"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import ArrowIcon from "public/Icons/arrowIcon"

type SortOrder = "asc" | "desc" | null

interface Ledger {
  sn: number
  purchaseLedgerId: string
  productName: string
  batchNo: string
  expDate: string
  returnQuantity: number
  walletAmount: string
  purchaseOrderId: string
  status: string
  amountWithTax: string
  createdDate: string
  originalId: number
  purchaseReturnReasonId: number
  returnReasonText: string
  supplierId: number
  supplierName: string
  taxRate: number
  originalExpDate: string
  totalRoundOffAmt: number
  originalData: any
}

interface GroupedPurchaseOrder {
  purchaseOrderId: string
  poDisplayId: string
  ledgers: Ledger[]
  expanded: boolean
  selected: boolean
}

// Modal Component for Return Note Confirmation
interface ReturnNoteModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: () => void
  loading: boolean
  selectedLedgers: Ledger[]
  error: string | null
}

const ReturnNoteModal: React.FC<ReturnNoteModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  selectedLedgers,
  error,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[500px] max-w-lg overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Create Return Note</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="max-h-[450px] overflow-y-auto px-4 pb-6">
        {selectedLedgers.length > 0 && (
          <div className="my-4 space-y-4">
            <p className="font-semibold">
              Are you sure you want to create a return note for {selectedLedgers.length} item
              {selectedLedgers.length !== 1 ? "s" : ""}?
            </p>
            <p>
              <strong>PO ID:</strong> {selectedLedgers[0]?.purchaseOrderId}
            </p>
            <p>
              <strong>Supplier:</strong> {selectedLedgers[0]?.supplierName}
            </p>

            <div className="border-t pt-2">
              <p className="font-semibold">Items to return:</p>
              {selectedLedgers.map((ledger, index) => (
                <div key={index} className="mt-2 border-b pb-2 last:border-b-0">
                  <p>
                    <strong>Product:</strong> {ledger.productName}
                  </p>
                  <p>
                    <strong>Batch No:</strong> {ledger.batchNo}
                  </p>
                  <p>
                    <strong>Return Quantity:</strong> {ledger.returnQuantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="my-2 rounded-md bg-red-100 p-2 text-red-600">{error}</div>}

        <div className="flex justify-end gap-4 pt-4">
          <ButtonModule variant="secondary" size="lg" onClick={onRequestClose} disabled={loading}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" size="lg" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Creating...
              </div>
            ) : (
              "Create Return Note"
            )}
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

// Function to calculate tax breakdown for each item
const calculateTaxBreakdownForItems = (ledgers: Ledger[]) => {
  return ledgers.map((ledger) => {
    const taxRate = ledger.taxRate || 0
    const amount = parseFloat(ledger.amountWithTax.replace(/,/g, "")) || 0
    const taxableAmount = amount / (1 + taxRate / 100)
    const totalTax = amount - taxableAmount

    // Calculate individual tax components
    const cgstRate = taxRate / 2
    const sgstRate = taxRate / 2
    const cgstAmount = totalTax / 2
    const sgstAmount = totalTax / 2

    return {
      ...ledger,
      taxBreakdown: {
        taxRate,
        taxableAmount,
        totalTax,
        cgstRate,
        sgstRate,
        cgstAmount,
        sgstAmount,
        igstRate: 0,
        igstAmount: 0,
      },
    }
  })
}

// Function to calculate tax breakdown summary
const calculateTaxBreakdownSummary = (ledgers: Ledger[]) => {
  const taxGroups: Record<
    number,
    {
      taxRate: number
      taxableAmount: number
      totalTax: number
      cgst: number
      sgst: number
      igst: number
    }
  > = {}

  ledgers.forEach((ledger) => {
    const taxRate = ledger.taxRate || 0
    const amount = parseFloat(ledger.amountWithTax.replace(/,/g, "")) || 0
    const taxableAmount = amount / (1 + taxRate / 100)
    const totalTax = amount - taxableAmount

    if (!taxGroups[taxRate]) {
      taxGroups[taxRate] = {
        taxRate,
        taxableAmount: 0,
        totalTax: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
      }
    }

    taxGroups[taxRate].taxableAmount += taxableAmount
    taxGroups[taxRate].totalTax += totalTax

    // Assuming GST where tax is split equally between CGST and SGST for same state
    if (taxRate > 0) {
      taxGroups[taxRate].cgst += totalTax / 2
      taxGroups[taxRate].sgst += totalTax / 2
    }
  })

  return Object.values(taxGroups)
}

// Modal Component for Viewing Group Details
interface ViewDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  groupedOrder: GroupedPurchaseOrder | null
  onCreateReturn: (orderId: string) => void
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  groupedOrder,
  onCreateReturn,
}) => {
  if (!groupedOrder) return null

  // Calculate tax breakdown for each item
  const itemsWithTaxBreakdown = calculateTaxBreakdownForItems(groupedOrder.ledgers)

  // Calculate total return amount
  const totalReturnAmount = groupedOrder.ledgers.reduce((sum, ledger) => sum + (ledger.totalRoundOffAmt || 0), 0)

  // Calculate tax breakdown summary
  const taxBreakdown = calculateTaxBreakdownSummary(groupedOrder.ledgers)
  const totalTaxAmount = taxBreakdown.reduce((sum, tax) => sum + tax.totalTax, 0)

  const handleCreateReturn = () => {
    onCreateReturn(groupedOrder.purchaseOrderId)
    onRequestClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[80%] overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center p-4"
    >
      <div className="sticky top-0 flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-xl font-bold">Purchase Order Details - {groupedOrder.poDisplayId}</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>

      <div className="max-h-[80vh] overflow-y-auto px-6 pb-8">
        {/* Invoice Header */}
        <div className="my-6 grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Supplier Information</h3>
            <p>
              <strong>Name:</strong> {groupedOrder.ledgers[0]?.supplierName}
            </p>
            <p>
              <strong>ID:</strong> {groupedOrder.ledgers[0]?.supplierId}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Order Information</h3>
            <p>
              <strong>PO ID:</strong> {groupedOrder.poDisplayId}
            </p>
            <p>
              <strong>Created Date:</strong> {groupedOrder.ledgers[0]?.createdDate}
            </p>
            <p>
              <strong>Total Items:</strong> {groupedOrder.ledgers.length}
            </p>
          </div>
        </div>

        {/* Items Table with Tax Breakdown */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#F4F9F8]">
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Ledger ID</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Product Name</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Batch No</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Expiry Date</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Tax Rate</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Return Qty</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Amount with Tax</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Taxable Amount</th>

                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Total Tax</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Rounded Amount</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Status</th>
                <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Return Reason</th>
              </tr>
            </thead>
            <tbody>
              {itemsWithTaxBreakdown.map((ledger, index) => (
                <React.Fragment key={index}>
                  <tr className="even:bg-gray-50 hover:bg-gray-50">
                    <td className="whitespace-nowrap border-b p-3 text-sm">{ledger.purchaseLedgerId}</td>
                    <td className="whitespace-nowrap border-b p-3 text-sm">{ledger.productName}</td>
                    <td className="whitespace-nowrap border-b p-3 text-sm">{ledger.batchNo}</td>
                    <td className="whitespace-nowrap border-b p-3 text-sm">{ledger.expDate}</td>
                    <td className="whitespace-nowrap border-b p-3 text-center text-sm">{ledger.taxRate}%</td>
                    <td className="whitespace-nowrap border-b p-3 text-center text-sm">{ledger.returnQuantity}</td>
                    <td className="whitespace-nowrap border-b p-3 text-center text-sm">₹{ledger.amountWithTax}</td>
                    <td className="whitespace-nowrap border-b p-3 text-center text-sm">
                      ₹{ledger.taxBreakdown.taxableAmount.toFixed(2)}
                    </td>

                    <td className="whitespace-nowrap border-b p-3 text-right text-sm">
                      ₹{ledger.taxBreakdown.totalTax.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap border-b p-3 text-right text-sm">₹{ledger.totalRoundOffAmt}</td>
                    <td className="whitespace-nowrap border-b p-3 text-sm">
                      <div className="flex">
                        <div
                          style={getStatusStyle(ledger.status)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                        >
                          <span className="size-2 rounded-full" style={dotStyle(ledger.status)}></span>
                          {getStatusText(ledger.status)}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b p-3 text-sm">{ledger.returnReasonText}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="mt-8 flex gap-8 border-t pt-6 ">
          {/* Tax Breakdown - Modified to show individual product breakdown */}
          <div className="w-full md:w-2/3">
            <h3 className="mb-4 text-lg font-semibold">Tax Summary by Product</h3>
            <div className="rounded-md border">
              <div className="grid grid-cols-6 border-b bg-gray-50 px-4 py-2 font-semibold">
                <div className="col-span-2">Product</div>
                <div>Tax Rate</div>
                <div>Taxable Amount</div>
                <div>CGST</div>
                <div>SGST</div>
                <div>Total Tax</div>
              </div>
              {itemsWithTaxBreakdown.map((ledger, index) => (
                <div key={index} className="grid grid-cols-6 border-b px-4 py-2 last:border-b-0">
                  <div className="col-span-2 truncate">{ledger.productName}</div>
                  <div>{ledger.taxRate}%</div>
                  <div>₹{ledger.taxBreakdown.taxableAmount.toFixed(2)}</div>
                  <div>
                    {ledger.taxBreakdown.cgstRate}% (₹{ledger.taxBreakdown.cgstAmount.toFixed(2)})
                  </div>
                  <div>
                    {ledger.taxBreakdown.sgstRate}% (₹{ledger.taxBreakdown.sgstAmount.toFixed(2)})
                  </div>
                  <div>₹{ledger.taxBreakdown.totalTax.toFixed(2)}</div>
                </div>
              ))}
              <div className="grid grid-cols-6 border-t bg-gray-50 px-4 py-2 font-semibold">
                <div className="col-span-5">Total Tax Amount</div>
                <div>₹{totalTaxAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Order Summary */}

          <div className="flex w-full justify-end md:w-1/3">
            <div className="w-full ">
              <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Subtotal:</span>
                <span>₹{(totalReturnAmount - totalTaxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Tax:</span>
                <span>₹{totalTaxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t py-2">
                <span className="font-semibold">Total Return Amount:</span>
                <span className="font-bold">₹{totalReturnAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Total Items:</span>
                <span>{groupedOrder.ledgers.length}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Total Return Quantity:</span>
                <span>{groupedOrder.ledgers.reduce((sum, ledger) => sum + ledger.returnQuantity, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8">
          <ButtonModule variant="secondary" size="lg" onClick={onRequestClose}>
            Close
          </ButtonModule>
          <ButtonModule variant="primary" size="lg" onClick={handleCreateReturn}>
            Create Return Note
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

// Skeleton Loading Component
const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 7 }).map((_, index) => (
      <td key={index} className="whitespace-nowrap border-b px-4 py-3">
        <div className="h-4 animate-pulse rounded bg-gray-200"></div>
      </td>
    ))}
  </tr>
)

// Helper functions for status styling
const getStatusStyle = (status: string) => {
  switch (status) {
    case "Y":
      return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    case "P":
      return { backgroundColor: "#EDF2FE", color: "#4976F4" }
    case "C":
      return { backgroundColor: "#EEF5F0", color: "#589E67" }
    case "R":
      return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
    default:
      return {}
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "Y":
      return "New"
    case "P":
      return "Processing"
    case "C":
      return "Completed"
    case "R":
      return "Rejected"
    default:
      return status
  }
}

const dotStyle = (status: string) => {
  switch (status) {
    case "Y":
      return { backgroundColor: "#D28E3D" }
    case "P":
      return { backgroundColor: "#4976F4" }
    case "C":
      return { backgroundColor: "#589E67" }
    case "R":
      return { backgroundColor: "#AF4B4B" }
    default:
      return {}
  }
}

const ReturnItems = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const purchaseLedgersGrouped = useAppSelector(selectPurchaseLedgersGrouped)
  const loading = useAppSelector(selectPurchaseLedgersLoading)
  const error = useAppSelector(selectPurchaseLedgersError)
  const returnReasons = useAppSelector(selectPurchaseReturnReasons)
  const returnReasonsLoading = useAppSelector(selectPurchaseReturnReasonsLoading)
  const returnReasonsError = useAppSelector(selectPurchaseReturnReasonsError)
  const creatingReturnNote = useAppSelector(selectCreatingReturnNote)
  const createReturnNoteError = useAppSelector(selectCreateReturnNoteError)
  const { suppliers, loading: suppliersLoading } = useAppSelector(selectSuppliers)

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [isReturnNoteModalOpen, setIsReturnNoteModalOpen] = useState(false)
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false)
  const [groupedOrders, setGroupedOrders] = useState<GroupedPurchaseOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<GroupedPurchaseOrder | null>(null)

  useEffect(() => {
    dispatch(fetchPurchaseLedgers())
    dispatch(fetchPurchaseReturnReasons())
    dispatch(fetchAllSuppliers())
  }, [dispatch])

  const getReturnReasonText = (reasonId: number) => {
    if (!returnReasons || returnReasons.length === 0) {
      return `Reason ${reasonId}`
    }

    const reason = returnReasons.find((r) => r.purchaseReturnReasonId === reasonId)
    return reason ? reason.reasonType : `Reason ${reasonId}`
  }

  const getSupplierName = (supplierId: number) => {
    if (!suppliers || suppliers.length === 0) {
      return `Supplier ${supplierId}`
    }

    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier ? supplier.name : `Supplier ${supplierId}`
  }

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")
  }

  const formatDateForAPI = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    if (purchaseLedgersGrouped && purchaseLedgersGrouped.length > 0) {
      let snCounter = 1
      const transformedOrders: GroupedPurchaseOrder[] = purchaseLedgersGrouped.map((order) => ({
        purchaseOrderId: order.purchaseOrderId.toString(),
        poDisplayId: `#PO${order.purchaseOrderId.toString().padStart(5, "0")}`,
        ledgers: order.ledgers.map((ledger) => ({
          sn: snCounter++,
          purchaseLedgerId: `#LEDG${ledger.purchaseLedgerId.toString().padStart(5, "0")}`,
          productName: ledger.productName,
          batchNo: ledger.batchNo,
          expDate: formatDateForDisplay(ledger.expDate),
          returnQuantity: ledger.returnQuantity,
          walletAmount: ledger.walletAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          purchaseOrderId: `#PO${ledger.purchaseOrderId.toString().padStart(5, "0")}`,
          status: ledger.status,
          amountWithTax: ledger.amountWithTax.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          createdDate: formatDateForDisplay(ledger.createdDate),
          originalId: ledger.purchaseLedgerId,
          purchaseReturnReasonId: ledger.purchaseReturnReasonId || 0,
          returnReasonText: getReturnReasonText(ledger.purchaseReturnReasonId),
          supplierId: ledger.supplierId,
          supplierName: getSupplierName(ledger.supplierId),
          taxRate: ledger.taxRate || 12,
          originalExpDate: ledger.expDate,
          totalRoundOffAmt: ledger.totalRoundOffAmt || 0,
          originalData: ledger,
        })),
        expanded: false,
        selected: false,
      }))
      setGroupedOrders(transformedOrders)
    } else {
      setGroupedOrders([])
    }
  }, [purchaseLedgersGrouped, returnReasons, suppliers])

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleAddLedger = () => {
    router.push(`purchases/reorder-reasons`)
  }

  const handleCreateReturnNote = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsReturnNoteModalOpen(true)
  }

  const handleViewDetails = (order: GroupedPurchaseOrder) => {
    setSelectedOrderForDetails(order)
    setIsViewDetailsModalOpen(true)
  }

  const handleConfirmReturnNote = async () => {
    if (!selectedOrderId) return

    try {
      const selectedOrder = groupedOrders.find((order) => order.purchaseOrderId === selectedOrderId)
      if (!selectedOrder) return

      const purchaseOrderId = parseInt(selectedOrder.purchaseOrderId)

      const returnNoteData = {
        purchaseOrderId: purchaseOrderId,
        ledgers: selectedOrder.ledgers.map((ledger) => ({
          purchaseLedgerId: ledger.originalId,
          supplierId: ledger.supplierId,
          productName: ledger.productName,
          batchNo: ledger.batchNo,
          expDate: formatDateForAPI(ledger.originalExpDate),
          taxRate: ledger.taxRate,
          returnQuantity: ledger.returnQuantity,
          walletAmount: parseFloat(ledger.walletAmount.replace(/,/g, "")),
          purchaseReturnReasonId: ledger.purchaseReturnReasonId,
          purchaseOrderId: purchaseOrderId,
          status: ledger.status,
          saleOrderId: null,
          amountWithTax: parseFloat(ledger.amountWithTax.replace(/,/g, "")),
          totalRoundOffAmt: Math.round(parseFloat(ledger.amountWithTax.replace(/,/g, ""))),
          createdDate: new Date().toISOString(),
        })),
      }

      await dispatch(createReturnNote(returnNoteData)).unwrap()

      setIsReturnNoteModalOpen(false)
      setSelectedOrderId(null)
      dispatch(fetchPurchaseLedgers())
    } catch (error) {
      console.error("Failed to create return note:", error)
    }
  }

  const handleCloseReturnNoteModal = () => {
    setIsReturnNoteModalOpen(false)
    setSelectedOrderId(null)
    dispatch(clearReturnNote())
  }

  const handleCloseViewDetailsModal = () => {
    setIsViewDetailsModalOpen(false)
    setSelectedOrderForDetails(null)
  }

  const expandAllOrders = () => {
    setGroupedOrders(groupedOrders.map((order) => ({ ...order, expanded: true })))
  }

  const collapseAllOrders = () => {
    setGroupedOrders(groupedOrders.map((order) => ({ ...order, expanded: false })))
  }

  const toggleOrderExpansion = (orderId: string) => {
    setGroupedOrders(
      groupedOrders.map((order) =>
        order.purchaseOrderId === orderId ? { ...order, expanded: !order.expanded } : order
      )
    )
  }

  const filteredOrders = groupedOrders.filter((order) =>
    Object.values(order).some((value) => {
      if (value === null || value === undefined) return false
      if (typeof value === "object") return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })
  )

  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getPaginationButtons = () => {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const buttons = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i)
      }
    } else {
      buttons.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        endPage = 4
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }

      if (startPage > 2) {
        buttons.push("ellipsis-left")
      }

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i)
      }

      if (endPage < totalPages - 1) {
        buttons.push("ellipsis-right")
      }

      buttons.push(totalPages)
    }

    return buttons
  }

  const selectedOrder = selectedOrderId
    ? groupedOrders.find((order) => order.purchaseOrderId === selectedOrderId)
    : null

  return (
    <>
      <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <p className="w-full text-lg font-semibold max-sm:pb-3 md:text-2xl">Purchase Ledgers</p>
          <div className="flex w-full justify-end gap-4">
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
              onClick={() => alert("Button clicked!")}
            >
              <p className="max-sm:hidden">Export</p>
            </ButtonModule>

            <ButtonModule
              variant="primary"
              size="md"
              onClick={() => handleAddLedger()}
              icon={<ArrowIcon />}
              iconPosition="end"
            >
              <p className="whitespace-nowrap max-sm:hidden">Reorder Reasons</p>
            </ButtonModule>
          </div>
        </div>

        {loading || returnReasonsLoading || suppliersLoading ? (
          <div className="w-full overflow-x-auto border-l border-r">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <th key={index} className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="h-4 animate-pulse rounded bg-gray-300"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
        ) : error || returnReasonsError ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <div className="text-center">
              <EmptyState />
              <p className="text-xl font-bold text-[#D82E2E]">Failed to load purchase data.</p>
              <p>{error || returnReasonsError}</p>
            </div>
          </div>
        ) : groupedOrders.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <EmptyState />
            <p className="text-base font-bold text-[#202B3C]">No purchase ledgers found.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto border-l border-r">
              <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">PO ID</th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">Supplier</th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">Return Quantity</th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">Wallet Amount</th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">Created Date</th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">Items</th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => {
                    const totalReturnQuantity = order.ledgers.reduce((sum, ledger) => sum + ledger.returnQuantity, 0)
                    const totalWalletAmount = order.ledgers.reduce(
                      (sum, ledger) => sum + parseFloat(ledger.walletAmount.replace(/,/g, "")),
                      0
                    )
                    const totalReturnAmount = order.ledgers.reduce(
                      (sum, ledger) => sum + (ledger.totalRoundOffAmt || 0),
                      0
                    )

                    return (
                      <React.Fragment key={order.purchaseOrderId}>
                        <tr className="cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <td className="border-b px-4 py-3 font-semibold">
                            <div className="flex items-center gap-2">{order.poDisplayId}</div>
                          </td>
                          <td className="border-b px-4 py-3">{order.ledgers[0]?.supplierName}</td>
                          <td className="border-b px-4 py-3">{totalReturnQuantity}</td>
                          <td className="border-b px-4 py-3">
                            ₹
                            {totalWalletAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border-b px-4 py-3">{order.ledgers[0]?.createdDate}</td>
                          <td className="border-b px-4 py-3">{order.ledgers.length}</td>
                          <td className="border-b px-4 py-3">
                            <div className="flex gap-2">
                              <ButtonModule variant="secondary" size="sm" onClick={() => handleViewDetails(order)}>
                                View Details
                              </ButtonModule>
                              <ButtonModule
                                variant="primary"
                                size="sm"
                                onClick={() => handleCreateReturnNote(order.purchaseOrderId)}
                              >
                                Create Return Note
                              </ButtonModule>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ReturnNoteModal
              isOpen={isReturnNoteModalOpen}
              onRequestClose={handleCloseReturnNoteModal}
              onConfirm={handleConfirmReturnNote}
              loading={creatingReturnNote}
              selectedLedgers={selectedOrder?.ledgers || []}
              error={createReturnNoteError}
            />

            <ViewDetailsModal
              isOpen={isViewDetailsModalOpen}
              onRequestClose={handleCloseViewDetailsModal}
              groupedOrder={selectedOrderForDetails}
              onCreateReturn={handleCreateReturnNote}
            />

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

export default ReturnItems
