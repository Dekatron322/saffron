import React, { useEffect, useState } from "react"
import { RxCaretSort } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "app/api/store/store"
import {
  fetchLowStockItems,
  selectLowStockItems,
  selectLowStockItemsError,
  selectLowStockItemsLoading,
} from "app/api/store/reorderSuggestionSlice"
import { fetchAllSuppliers, selectSuppliers } from "app/api/store/supplierSlice"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"

// Interfaces based on the API response
interface Category {
  createdDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
  catId: number
  catName: string
}

interface BatchDetailsDto {
  mrp: number
  batchNo: string
  mfg: string | null
  mfgDate: string
  expDate: string
  packing: string
  productDto: any | null
}

interface LowStockProduct {
  productId: number
  productName: string
  description: string
  category: Category
  manufacturer: string
  price: number | null
  productCode: string
  defaultMRP: number
  salePrice: number
  purchasePrice: number
  discountType: string
  saleDiscount: number
  openingStockQuantity: number
  minimumStockQuantity: number
  itemLocation: string
  taxRate: number
  inclusiveOfTax: boolean
  baseUnit: any | null
  secondaryUnit: any | null
  conversionRate: any | null
  branch: number
  itemName: string
  batchNo: string | null
  modelNo: string
  size: string
  mfgDate: string
  expDate: string
  mrp: string
  hsn: number
  reorderQuantity: number
  currentStockLevel: number
  reorderThreshold: number
  supplierId: number
  unitId: number
  packagingSize: number
  productStatus: boolean
  refundable: string
  paymentCategory: string | null
  type: string | null
  paidAmount: string | null
  linkPayment: boolean
  deductibleWalletAmount: number | null
  batchDetails: any | null
  batchDetailsDtoList: BatchDetailsDto[]
  points: any | null
}

interface SupplierLowStock {
  supplierId: number
  supplierName?: string
  contact?: string
  email?: string
  lastPurchasedDate?: string
  products: LowStockProduct[]
}

interface SupplierInfo {
  id: number
  name: string
  contactDetails: string
  address: string
  email: string
  gstNumber: string
  gstAddress: string
}

// Modal Component for Viewing Supplier Details
interface SupplierDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  supplier: SupplierLowStock | null
  onReorder: (supplierId: number, productIds: number[]) => void
}

const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({ isOpen, onRequestClose, supplier, onReorder }) => {
  if (!supplier) return null

  const [selectedProducts, setSelectedProducts] = useState<number[]>([])

  const handleProductSelect = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === supplier.products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(supplier.products.map((product) => product.productId))
    }
  }

  const handleReorder = () => {
    onReorder(supplier.supplierId, selectedProducts)
    onRequestClose()
  }

  const getStockStatus = (currentStock: number, threshold: number) => {
    if (currentStock <= 0) return { status: "Out of Stock", style: { backgroundColor: "#F7EDED", color: "#AF4B4B" } }
    if (currentStock <= threshold)
      return { status: "Low Stock", style: { backgroundColor: "#FBF4EC", color: "#D28E3D" } }
    return { status: "Adequate", style: { backgroundColor: "#EEF5F0", color: "#589E67" } }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "Out of Stock":
        return { backgroundColor: "#AF4B4B" }
      case "Low Stock":
        return { backgroundColor: "#D28E3D" }
      case "Adequate":
        return { backgroundColor: "#589E67" }
      default:
        return {}
    }
  }

  // Selection helpers for "Select All" checkbox with indeterminate state
  const allSelected = selectedProducts.length === supplier.products.length
  const someSelected = selectedProducts.length > 0 && !allSelected

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[90%] max-w-6xl overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center p-4"
    >
      <div className="sticky top-0 flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-xl font-bold leading-tight text-[#1c232b]">
          {supplier.supplierName || `Supplier ${supplier.supplierId}`}
        </h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>

      <div className="max-h-[80vh] overflow-y-auto px-6 pb-8">
        {/* Supplier Information */}
        <div className="my-6 grid grid-cols-1 gap-6 border-b pb-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Supplier Information</h3>

            <p>
              <strong>Name:</strong> {supplier.supplierName || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {supplier.contact || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {supplier.email || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold ">Stock Summary</h3>
            <p className="text-[#589E67]">
              <strong>Total Products:</strong> {supplier.products.length}
            </p>
            <p className="text-[#D28E3D]">
              <strong>Low Stock Items:</strong>{" "}
              {supplier.products.filter((product) => product.currentStockLevel <= product.reorderThreshold).length}
            </p>
            <p className="text-[#AF4B4B]">
              <strong>Out of Stock Items:</strong>{" "}
              {supplier.products.filter((product) => product.currentStockLevel === 0).length}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Products</h3>
            <div className="flex gap-2">
              <ButtonModule variant="secondary" size="sm" onClick={handleSelectAll}>
                {selectedProducts.length === supplier.products.length ? "Deselect All" : "Select All"}
              </ButtonModule>
              <ButtonModule
                variant="primary"
                size="sm"
                onClick={handleReorder}
                disabled={selectedProducts.length === 0}
              >
                Reorder Selected ({selectedProducts.length})
              </ButtonModule>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#F4F9F8]">
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      aria-label="Select all products"
                      className="h-4 w-4 cursor-pointer align-middle"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Product Name</th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Product Code</th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Manufacturer</th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Current Stock</th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Reorder Threshold</th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Suggested Qty</th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Status</th>
                  <th className="whitespace-nowrap border-b p-3 text-sm font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {supplier.products.map((product, index) => {
                  const stockStatus = getStockStatus(product.currentStockLevel, product.reorderThreshold)
                  const isSelected = selectedProducts.includes(product.productId)

                  return (
                    <tr key={index} className="even:bg-gray-50 hover:bg-gray-50">
                      <td className="whitespace-nowrap border-b p-3 text-sm">
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.productName}`}
                          className="h-4 w-4 cursor-pointer bg-white align-middle"
                          checked={isSelected}
                          onChange={() => handleProductSelect(product.productId)}
                        />
                      </td>
                      <td className="whitespace-nowrap border-b p-3 text-sm">{product.productName}</td>
                      <td className="whitespace-nowrap border-b p-3 text-sm">{product.productCode}</td>
                      <td className="whitespace-nowrap border-b p-3 text-sm">{product.manufacturer}</td>
                      <td className="whitespace-nowrap border-b p-3 text-center text-sm">
                        {product.currentStockLevel}
                      </td>
                      <td className="whitespace-nowrap border-b p-3 text-center text-sm">{product.reorderThreshold}</td>
                      <td className="whitespace-nowrap border-b p-3 text-center text-sm">{product.reorderQuantity}</td>
                      <td className="whitespace-nowrap border-b p-3 text-sm">
                        <div
                          className="flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                          style={stockStatus.style}
                        >
                          <span className="size-2 rounded-full" style={dotStyle(stockStatus.status)}></span>
                          {stockStatus.status}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b p-3 text-right text-sm">
                        ₹{product.purchasePrice.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8">
          <ButtonModule variant="secondary" size="lg" onClick={onRequestClose}>
            Close
          </ButtonModule>
          <ButtonModule variant="primary" size="lg" onClick={handleReorder} disabled={selectedProducts.length === 0}>
            Reorder Selected Items
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

const ReorderSummary = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const lowStockItems = useAppSelector(selectLowStockItems)
  const loading = useAppSelector(selectLowStockItemsLoading)
  const error = useAppSelector(selectLowStockItemsError)
  const { suppliers: allSuppliers } = useAppSelector(selectSuppliers)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(7)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierLowStock | null>(null)

  // Fetch low stock items and suppliers on component mount
  useEffect(() => {
    dispatch(fetchLowStockItems())
    dispatch(fetchAllSuppliers())
  }, [dispatch])

  // Enhance supplier data with contact information from the supplierSlice
  const enhancedLowStockItems: SupplierLowStock[] = lowStockItems.map((supplier) => {
    const supplierInfo = allSuppliers.find((s) => s.id === supplier.supplierId)
    return {
      ...supplier,
      supplierName: supplierInfo?.name,
      contact: supplierInfo?.contactDetails,
      email: supplierInfo?.email,
      lastPurchasedDate: "2024-12-20", // Mock data - in real app, you'd get this from API
    }
  })

  const getPaymentStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "Paid":
      case "Completed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Pending":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Not Paid":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "Overdue":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "Low Stock":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Adequate":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      default:
        return {}
    }
  }

  const dotStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "Paid":
      case "Completed":
        return { backgroundColor: "#589E67" }
      case "Pending":
        return { backgroundColor: "#D28E3D" }
      case "Not Paid":
      case "Overdue":
        return { backgroundColor: "#AF4B4B" }
      case "Confirmed":
        return { backgroundColor: "#4976F4" }
      case "Low Stock":
        return { backgroundColor: "#D28E3D" }
      case "Adequate":
        return { backgroundColor: "#589E67" }
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

  const handleAddInvoice = () => {
    router.push(`/purchases/order-creation`)
  }

  const handleViewSupplier = (supplier: SupplierLowStock) => {
    setSelectedSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSupplier(null)
  }

  const handleReorder = (supplierId: number, productIds: number[]) => {
    // Navigate to order creation with selected products
    router.push(`/purchases/order-creation?supplierId=${supplierId}&productIds=${productIds.join(",")}`)
  }

  const filteredSuppliers = enhancedLowStockItems.filter((supplier) =>
    Object.values(supplier).some((value) => {
      if (value === null || value === undefined) return false
      if (typeof value === "object") return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })
  )

  // Get current suppliers for pagination
  const indexOfLastSupplier = currentPage * itemsPerPage
  const indexOfFirstSupplier = indexOfLastSupplier - itemsPerPage
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Calculate low stock statistics
  const getLowStockStats = (supplier: SupplierLowStock) => {
    const lowStockCount = supplier.products.filter(
      (product) => product.currentStockLevel <= product.reorderThreshold && product.currentStockLevel > 0
    ).length
    const outOfStockCount = supplier.products.filter((product) => product.currentStockLevel === 0).length
    const adequateCount = supplier.products.length - lowStockCount - outOfStockCount

    return { lowStockCount, outOfStockCount, adequateCount }
  }

  return (
    <>
      <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 md:p-5">
        {/* Header */}
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <p className="text-lg font-semibold max-sm:pb-3 md:text-2xl">Reorder Suggestions</p>
          <div className="flex gap-4">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              className="min-w-[350px]"
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

        {loading ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <div className="text-center">
              <p className="text-xl font-bold">Loading reorder suggestions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <div className="text-center">
              <EmptyState />
              <p className="text-xl font-bold text-[#D82E2E]">Failed to load reorder suggestions.</p>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F4F9F8]">
            <EmptyState />
            <p className="text-base font-bold text-[#202B3C]">No low stock items found.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto border-l border-r ">
              <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("supplierName")}
                    >
                      <div className="flex items-center gap-2">
                        Supplier Name <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("products")}
                    >
                      <div className="flex items-center gap-2">
                        Total Products <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("lowStockCount")}
                    >
                      <div className="flex items-center gap-2">
                        Low Stock Items <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("outOfStockCount")}
                    >
                      <div className="flex items-center gap-2">
                        Out of Stock <RxCaretSort />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("contact")}
                    >
                      <div className="flex items-center gap-2">
                        Contact <RxCaretSort />
                      </div>
                    </th>

                    <th
                      className="cursor-pointer whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm"
                      onClick={() => toggleSort("lastPurchasedDate")}
                    >
                      <div className="flex items-center gap-2">
                        Last Purchased <RxCaretSort />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b bg-[#F4F9F8] p-4 text-sm">
                      <div className="flex items-center gap-2">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentSuppliers.map((supplier, index) => {
                    const stats = getLowStockStats(supplier)

                    return (
                      <tr key={index}>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            {supplier.supplierName || `Supplier ${supplier.supplierId}`}
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">{supplier.products.length}</div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                              style={getPaymentStyle("Low Stock")}
                            >
                              <span className="size-2 rounded-full" style={dotStyle("Low Stock")}></span>
                              {stats.lowStockCount}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                              style={getPaymentStyle("Not Paid")}
                            >
                              <span className="size-2 rounded-full" style={dotStyle("Not Paid")}></span>
                              {stats.outOfStockCount}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">{supplier.contact || "N/A"}</div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <img src="/DashboardImages/Calendar.png" alt="calendar" />
                            {supplier.lastPurchasedDate || "N/A"}
                          </div>
                        </td>
                        <td
                          className="cursor-pointer whitespace-nowrap border-b px-4 py-1 text-sm text-[#007AFF]"
                          onClick={() => handleViewSupplier(supplier)}
                        >
                          View
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <SupplierDetailsModal
              isOpen={isModalOpen}
              onRequestClose={handleCloseModal}
              supplier={selectedSupplier}
              onReorder={handleReorder}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstSupplier + 1} to {Math.min(indexOfLastSupplier, filteredSuppliers.length)} of{" "}
                {filteredSuppliers.length} entries
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

                {Array.from({ length: Math.ceil(filteredSuppliers.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`rounded-full px-3 py-1 ${
                      currentPage === index + 1 ? "bg-primary text-[#ffffff]" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredSuppliers.length / itemsPerPage)}
                  className={`rounded-full px-2 py-1 ${
                    currentPage === Math.ceil(filteredSuppliers.length / itemsPerPage)
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

export default ReorderSummary
